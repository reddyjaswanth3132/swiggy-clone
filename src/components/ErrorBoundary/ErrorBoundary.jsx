import { Component } from 'react';
import './ErrorBoundary.css';

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <div className="error-boundary__content">
                        <div className="error-boundary__icon">😵</div>
                        <h1>Oops! Something went wrong</h1>
                        <p>We're sorry, but something unexpected happened. Please try again.</p>
                        <button className="error-boundary__btn" onClick={this.handleReset}>
                            Go to Home Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
