import SwiftUI

/// Zak Rad — the friendly fox guide of Zak's Brain Games.
///
/// A single, reusable mascot view that mirrors the web `<zak-rad>` component:
/// pick a `pose` and optionally give him a short, encouraging `message` that
/// shows in a speech bubble. The pose artwork lives in `Assets.xcassets`
/// (`zakrad-<pose>` image sets), kept in sync with the website's SVGs.
///
/// Example:
/// ```swift
/// ZakRad(pose: .walking, message: "Loading your games…")
/// ```
struct ZakRad: View {
    /// The available mascot poses, matching the website's asset names.
    enum Pose: String {
        case hero, pointing, walking, highfive, thumbsup, sitting

        var assetName: String { "zakrad-\(rawValue)" }

        /// Meaningful description for VoiceOver.
        var accessibilityLabel: String {
            switch self {
            case .hero:     return "Zak Rad the fox standing proudly"
            case .pointing: return "Zak Rad the fox pointing with a helpful idea"
            case .walking:  return "Zak Rad the fox walking along"
            case .highfive: return "Zak Rad the fox raising a paw for a high five"
            case .thumbsup: return "Zak Rad the fox giving a thumbs up"
            case .sitting:  return "Zak Rad the fox sitting calmly"
            }
        }
    }

    let pose: Pose
    var message: String? = nil
    var size: CGFloat = 160
    /// When true (and the user hasn't asked to reduce motion) Zak gently bobs.
    var bobbing: Bool = false

    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var bob = false

    var body: some View {
        VStack(spacing: 8) {
            if let message, !message.isEmpty {
                SpeechBubble(text: message)
            }
            Image(pose.assetName)
                .resizable()
                .scaledToFit()
                .frame(width: size, height: size)
                .accessibilityLabel(Text(pose.accessibilityLabel))
                .offset(y: (bobbing && !reduceMotion && bob) ? -8 : 0)
                .animation(
                    (bobbing && !reduceMotion)
                        ? .easeInOut(duration: 2).repeatForever(autoreverses: true)
                        : .default,
                    value: bob
                )
        }
        .onAppear { if bobbing && !reduceMotion { bob = true } }
    }
}

/// A rounded white speech bubble with a downward tail, styled like the web bubble.
private struct SpeechBubble: View {
    let text: String

    var body: some View {
        Text(text)
            .font(.system(size: 17, weight: .semibold, design: .rounded))
            .foregroundColor(Color(red: 0.176, green: 0.176, blue: 0.373)) // #2D2D5F
            .multilineTextAlignment(.center)
            .padding(.horizontal, 18)
            .padding(.vertical, 12)
            .background(
                ZStack {
                    RoundedRectangle(cornerRadius: 18, style: .continuous)
                        .fill(Color.white)
                    Triangle()
                        .fill(Color.white)
                        .frame(width: 22, height: 12)
                        .offset(y: 6)
                        .frame(maxHeight: .infinity, alignment: .bottom)
                }
            )
            .shadow(color: Color(.sRGB, red: 0.176, green: 0.176, blue: 0.373, opacity: 0.18),
                    radius: 10, x: 0, y: 8)
            .frame(maxWidth: 300)
    }
}

private struct Triangle: Shape {
    func path(in rect: CGRect) -> Path {
        var p = Path()
        p.move(to: CGPoint(x: rect.midX, y: rect.maxY))
        p.addLine(to: CGPoint(x: rect.minX, y: rect.minY))
        p.addLine(to: CGPoint(x: rect.maxX, y: rect.minY))
        p.closeSubpath()
        return p
    }
}

/// Friendly full-screen loading state shown while the web content boots up.
/// Uses the `walking` pose, exactly like the website's loading/transition states.
struct ZakRadLoadingView: View {
    var message: String = "Let's go — loading your games!"

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [
                    Color(red: 1.0, green: 0.973, blue: 0.906),  // cream
                    Color(red: 0.898, green: 0.957, blue: 1.0)   // light blue
                ],
                startPoint: .topLeading, endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            ZakRad(pose: .walking, message: message, size: 180, bobbing: true)
                .padding()
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel(Text("Loading Zak's Brain Games"))
    }
}

#if DEBUG
#Preview {
    ZakRadLoadingView()
}
#endif
