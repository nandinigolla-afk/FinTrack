import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Surface it in the console so it's diagnosable from a bug report/screenshot
    // instead of just a silent blank page.
    console.error("FinTrack crashed:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.assign("/dashboard");
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-ink px-5">
          <div className="bg-linen rounded-lg shadow-2xl p-8 max-w-md w-full text-center border border-moss-700/30">
            <p className="font-mono text-xs text-gold-600 tracking-widest mb-2">FINTRACK</p>
            <h1 className="font-display text-2xl text-ink mb-2">Something went wrong</h1>
            <p className="text-sm text-slate-500 mb-6">
              A page component hit an unexpected error. Your data is safe — reloading usually fixes this.
            </p>
            <button
              onClick={this.handleReset}
              className="bg-moss-600 text-linen rounded-md px-5 py-2.5 text-sm font-medium hover:bg-moss-700 transition-colors"
            >
              Reload FinTrack
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
