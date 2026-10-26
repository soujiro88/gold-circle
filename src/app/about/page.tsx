import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Circle",
  description: "Learn more about Circle and the ideas behind it.",
};

export default function AboutPage() {
  return (
    <section className="about-page" aria-labelledby="about-title">
      <div className="main-heading">
        <h1 id="about-title">About Circle</h1>
        <p className="subtitle">A place to learn, share, and grow with Next.js.</p>
      </div>

      <div className="about-content">
        <p>
          Circle is a simple space for exploring web development ideas, practical
          lessons, and the possibilities of modern React applications.
        </p>
        <p>
          Whether you are building your first project or refining your craft,
          Circle is here to help you keep learning and moving forward.
        </p>
      </div>
    </section>
  );
}
