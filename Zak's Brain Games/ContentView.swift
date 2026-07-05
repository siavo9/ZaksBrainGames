import SwiftUI
import WebKit

struct ContentView: View {
    /// Shared loading state so Zak Rad can greet players while the site boots.
    @StateObject private var loader = WebLoadState()

    var body: some View {
        ZStack {
            WebView(loader: loader)
                .ignoresSafeArea()

            // Friendly Zak Rad loading state, shown until the website is ready.
            if loader.isLoading {
                ZakRadLoadingView()
                    .transition(.opacity)
            }
        }
        .animation(.easeOut(duration: 0.35), value: loader.isLoading)
    }
}

/// Tracks whether the bundled website has finished its first load.
final class WebLoadState: ObservableObject {
    @Published var isLoading: Bool = true
}

/// Hosts the bundled "Zak's Brain Games" website (the `public/` folder) in a
/// fully offline WKWebView. The whole `public/` directory is bundled via a
/// folder reference in the Xcode project, so the app always ships whatever is
/// currently in `public/` at build time — no manual syncing required.
///
/// The site is served through a custom URL scheme (`appsite://`) handled by
/// `BundleAssetSchemeHandler` rather than via `file://`. This matters because
/// WKWebView blocks `XMLHttpRequest`/`fetch` between `file://` URLs, which
/// silently breaks games that load assets at runtime — e.g. Demo Derby fetches
/// its 3D car models (`.glb`) with `THREE.GLTFLoader`, so on `file://` every car
/// falls back to a plain box. A custom scheme gives the page normal same-origin
/// HTTP semantics, so those loaders work exactly like they do on the website —
/// while still running fully offline from the app bundle.
struct WebView: UIViewRepresentable {
    @ObservedObject var loader: WebLoadState

    func makeCoordinator() -> Coordinator { Coordinator(loader: loader) }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []

        // Serve everything under public/ through our custom scheme handler.
        let root = Self.bundledSiteRoot()
        let handler = BundleAssetSchemeHandler(root: root)
        config.setURLSchemeHandler(handler, forURLScheme: BundleAssetSchemeHandler.scheme)

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator
        webView.scrollView.bounces = false
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.isOpaque = true
        webView.allowsBackForwardNavigationGestures = true

        // Keep a strong reference to the handler for the web view's lifetime.
        context.coordinator.schemeHandler = handler

        if let start = URL(string: "\(BundleAssetSchemeHandler.scheme)://site/index.html") {
            webView.load(URLRequest(url: start))
        }
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {}

    /// Locates the bundled `public/` directory (the site root).
    private static func bundledSiteRoot() -> URL {
        if let indexURL = Bundle.main.url(forResource: "index",
                                          withExtension: "html",
                                          subdirectory: "public") {
            return indexURL.deletingLastPathComponent()
        }
        if let fallback = Bundle.main.url(forResource: "index", withExtension: "html") {
            return fallback.deletingLastPathComponent()
        }
        // Last resort: the bundle root. The handler will simply 404 if a file
        // isn't found there.
        return Bundle.main.bundleURL
    }

    /// Keeps in-app navigation inside the web view, and dismisses the Zak Rad
    /// loading view once the site is ready.
    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate {
        let loader: WebLoadState
        /// Strong reference so the scheme handler outlives `makeUIView`.
        var schemeHandler: BundleAssetSchemeHandler?
        init(loader: WebLoadState) { self.loader = loader }

        func webView(_ webView: WKWebView,
                     createWebViewWith configuration: WKWebViewConfiguration,
                     for navigationAction: WKNavigationAction,
                     windowFeatures: WKWindowFeatures) -> WKWebView? {
            if let url = navigationAction.request.url {
                webView.load(URLRequest(url: url))
            }
            return nil
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            finishLoading()
        }

        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            finishLoading()
        }

        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            finishLoading()
        }

        private func finishLoading() {
            // Keeps the splash from sticking if a load ends in any terminal state.
            DispatchQueue.main.async { [weak loader] in loader?.isLoading = false }
        }
    }
}

/// Serves files from the bundled `public/` directory over a custom URL scheme so
/// the offline site behaves like a normal same-origin web server. This is what
/// lets runtime asset loaders (e.g. `fetch`/XHR used by THREE.GLTFLoader for the
/// Demo Derby `.glb` car models) work — those are blocked between `file://` URLs
/// but allowed under a custom scheme. Also supports HTTP Range requests so
/// audio/video elements can stream and seek.
final class BundleAssetSchemeHandler: NSObject, WKURLSchemeHandler {
    /// Must be lowercase and not a built-in scheme (http/https/file/…).
    static let scheme = "appsite"

    private let root: URL
    private let queue = DispatchQueue(label: "BundleAssetSchemeHandler", qos: .userInitiated)
    private let lock = NSLock()
    private var activeTasks = Set<ObjectIdentifier>()

    init(root: URL) {
        self.root = root.standardizedFileURL
        super.init()
    }

    func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
        let id = ObjectIdentifier(urlSchemeTask)
        lock.lock(); activeTasks.insert(id); lock.unlock()

        queue.async { [weak self] in
            guard let self = self else { return }
            self.serve(urlSchemeTask, id: id)
            self.lock.lock(); self.activeTasks.remove(id); self.lock.unlock()
        }
    }

    func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {
        // Mark the task cancelled so the worker stops delivering to it.
        lock.lock(); activeTasks.remove(ObjectIdentifier(urlSchemeTask)); lock.unlock()
    }

    // MARK: - Serving

    private func isActive(_ id: ObjectIdentifier) -> Bool {
        lock.lock(); defer { lock.unlock() }
        return activeTasks.contains(id)
    }

    private func serve(_ task: WKURLSchemeTask, id: ObjectIdentifier) {
        guard let requestURL = task.request.url else {
            finish(task, id: id, error: URLError(.badURL)); return
        }

        // Resolve the requested path (ignoring host/query/fragment) to a file
        // inside the bundled site root, guarding against directory traversal.
        guard let fileURL = resolveFile(for: requestURL) else {
            respondNotFound(task, id: id, url: requestURL); return
        }

        guard let data = try? Data(contentsOf: fileURL) else {
            respondNotFound(task, id: id, url: requestURL); return
        }

        let mime = Self.mimeType(forExtension: fileURL.pathExtension)
        let rangeHeader = task.request.value(forHTTPHeaderField: "Range")

        if let rangeHeader = rangeHeader,
           let range = Self.parseRange(rangeHeader, totalLength: data.count) {
            let slice = data.subdata(in: range)
            let headers: [String: String] = [
                "Content-Type": mime,
                "Content-Length": String(slice.count),
                "Content-Range": "bytes \(range.lowerBound)-\(range.upperBound - 1)/\(data.count)",
                "Accept-Ranges": "bytes",
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "no-cache"
            ]
            guard isActive(id),
                  let response = HTTPURLResponse(url: requestURL, statusCode: 206,
                                                 httpVersion: "HTTP/1.1", headerFields: headers) else { return }
            deliver(task, id: id, response: response, data: slice)
        } else {
            let headers: [String: String] = [
                "Content-Type": mime,
                "Content-Length": String(data.count),
                "Accept-Ranges": "bytes",
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "no-cache"
            ]
            guard isActive(id),
                  let response = HTTPURLResponse(url: requestURL, statusCode: 200,
                                                 httpVersion: "HTTP/1.1", headerFields: headers) else { return }
            deliver(task, id: id, response: response, data: data)
        }
    }

    /// Maps a request URL to a file inside `root`. Returns nil if the file is
    /// missing or the path escapes the site root.
    private func resolveFile(for url: URL) -> URL? {
        var path = url.path
        if path.isEmpty { path = "/" }

        let relative = path.hasPrefix("/") ? String(path.dropFirst()) : path
        var candidate = root.appendingPathComponent(relative).standardizedFileURL

        // Block traversal outside the bundled site root.
        guard candidate.path == root.path || candidate.path.hasPrefix(root.path + "/") else {
            return nil
        }

        var isDir: ObjCBool = false
        let fm = FileManager.default
        if fm.fileExists(atPath: candidate.path, isDirectory: &isDir) {
            if isDir.boolValue {
                // Directory (or trailing-slash) request -> serve its index.html.
                candidate = candidate.appendingPathComponent("index.html")
                guard fm.fileExists(atPath: candidate.path) else { return nil }
                return candidate
            }
            return candidate
        }

        // Path with a trailing slash that FileManager didn't match as a dir.
        if path.hasSuffix("/") {
            let indexURL = candidate.appendingPathComponent("index.html")
            if fm.fileExists(atPath: indexURL.path) { return indexURL }
        }
        return nil
    }

    private func respondNotFound(_ task: WKURLSchemeTask, id: ObjectIdentifier, url: URL) {
        guard isActive(id),
              let response = HTTPURLResponse(url: url, statusCode: 404,
                                             httpVersion: "HTTP/1.1",
                                             headerFields: ["Content-Type": "text/plain"]) else { return }
        deliver(task, id: id, response: response, data: Data("Not found".utf8))
    }

    private func deliver(_ task: WKURLSchemeTask, id: ObjectIdentifier, response: URLResponse, data: Data) {
        guard isActive(id) else { return }
        task.didReceive(response)
        guard isActive(id) else { return }
        task.didReceive(data)
        guard isActive(id) else { return }
        task.didFinish()
    }

    private func finish(_ task: WKURLSchemeTask, id: ObjectIdentifier, error: Error) {
        guard isActive(id) else { return }
        task.didFailWithError(error)
    }

    // MARK: - Helpers

    /// Parses a single-range "bytes=start-end" header into a half-open range.
    private static func parseRange(_ header: String, totalLength: Int) -> Range<Int>? {
        guard totalLength > 0,
              header.hasPrefix("bytes=") else { return nil }
        let spec = header.dropFirst("bytes=".count)
        // Only the first range is honored (sufficient for media playback).
        let firstSpec = spec.split(separator: ",").first.map(String.init) ?? String(spec)
        let parts = firstSpec.split(separator: "-", maxSplits: 1, omittingEmptySubsequences: false)
        guard parts.count == 2 else { return nil }

        let startStr = parts[0].trimmingCharacters(in: .whitespaces)
        let endStr = parts[1].trimmingCharacters(in: .whitespaces)

        if startStr.isEmpty {
            // Suffix range: bytes=-N (last N bytes)
            guard let suffix = Int(endStr), suffix > 0 else { return nil }
            let start = max(0, totalLength - suffix)
            return start..<totalLength
        }

        guard let start = Int(startStr), start < totalLength else { return nil }
        let end: Int
        if endStr.isEmpty {
            end = totalLength - 1
        } else {
            guard let parsedEnd = Int(endStr) else { return nil }
            end = min(parsedEnd, totalLength - 1)
        }
        guard end >= start else { return nil }
        return start..<(end + 1)
    }

    private static func mimeType(forExtension ext: String) -> String {
        switch ext.lowercased() {
        case "html", "htm": return "text/html; charset=utf-8"
        case "js", "mjs":   return "text/javascript; charset=utf-8"
        case "css":         return "text/css; charset=utf-8"
        case "json":        return "application/json; charset=utf-8"
        case "svg":         return "image/svg+xml"
        case "png":         return "image/png"
        case "jpg", "jpeg": return "image/jpeg"
        case "gif":         return "image/gif"
        case "webp":        return "image/webp"
        case "ico":         return "image/x-icon"
        case "glb":         return "model/gltf-binary"
        case "gltf":        return "model/gltf+json"
        case "mp3":         return "audio/mpeg"
        case "wav":         return "audio/wav"
        case "ogg":         return "audio/ogg"
        case "m4a":         return "audio/mp4"
        case "mp4":         return "video/mp4"
        case "woff":        return "font/woff"
        case "woff2":       return "font/woff2"
        case "ttf":         return "font/ttf"
        case "otf":         return "font/otf"
        case "txt":         return "text/plain; charset=utf-8"
        case "xml":         return "application/xml; charset=utf-8"
        case "wasm":        return "application/wasm"
        case "map":         return "application/json; charset=utf-8"
        default:            return "application/octet-stream"
        }
    }
}
