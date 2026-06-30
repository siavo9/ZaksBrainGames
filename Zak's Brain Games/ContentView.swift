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
struct WebView: UIViewRepresentable {
    @ObservedObject var loader: WebLoadState

    func makeCoordinator() -> Coordinator { Coordinator(loader: loader) }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator
        webView.scrollView.bounces = false
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.isOpaque = true
        webView.allowsBackForwardNavigationGestures = true
        load(into: webView)
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {}

    /// Loads `public/index.html` and grants read access to the entire `public/`
    /// directory so relative links to the game folders resolve offline.
    private func load(into webView: WKWebView) {
        if let indexURL = Bundle.main.url(forResource: "index",
                                          withExtension: "html",
                                          subdirectory: "public") {
            let publicDir = indexURL.deletingLastPathComponent()
            webView.loadFileURL(indexURL, allowingReadAccessTo: publicDir)
        } else if let fallback = Bundle.main.url(forResource: "index", withExtension: "html") {
            webView.loadFileURL(fallback, allowingReadAccessTo: fallback.deletingLastPathComponent())
        }
    }

    /// Keeps any target="_blank" / window.open navigation inside the app, and
    /// dismisses the Zak Rad loading view once the site is ready.
    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate {
        let loader: WebLoadState
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
