import SwiftUI
import WebKit

struct ContentView: View {
    var body: some View {
        WebView()
            .ignoresSafeArea()
    }
}

/// Hosts the bundled "Zak's Brain Games" website (the `public/` folder) in a
/// fully offline WKWebView. The whole `public/` directory is bundled via a
/// folder reference in the Xcode project, so the app always ships whatever is
/// currently in `public/` at build time — no manual syncing required.
struct WebView: UIViewRepresentable {
    func makeCoordinator() -> Coordinator { Coordinator() }

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

    /// Keeps any target="_blank" / window.open navigation inside the app.
    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate {
        func webView(_ webView: WKWebView,
                     createWebViewWith configuration: WKWebViewConfiguration,
                     for navigationAction: WKNavigationAction,
                     windowFeatures: WKWindowFeatures) -> WKWebView? {
            if let url = navigationAction.request.url {
                webView.load(URLRequest(url: url))
            }
            return nil
        }
    }
}
