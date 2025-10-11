function FAQ() {
    const faqs = [
        {
            question: "What is this service?",
            answer: "This is a license key management system that allows you to generate, manage, and validate license keys for your applications or services."
        },
        {
            question: "How many licenses can I create?",
            answer: "Free users can create up to 3 licenses. Premium users have unlimited license generation and can create up to 1000 licenses at once."
        },
        {
            question: "What happens to my licenses if I delete my account?",
            answer: "All licenses associated with your account will be permanently deleted. This action cannot be undone."
        },
        {
            question: "How do I integrate license validation into my application?",
            answer: "Use our public API endpoint /licenses/validate with your license key. No authentication required for validation requests."
        },
        {
            question: "Can I customize my license key format?",
            answer: "Yes! Premium users can use custom patterns with wildcards (*) that will be replaced with random characters during generation."
        },
        {
            question: "How often are global statistics updated?",
            answer: "Global statistics are updated once per day to show platform-wide usage metrics including total users, licenses created, and validation requests."
        },
        {
            question: "Is my data secure?",
            answer: "Yes! All passwords are encrypted using bcrypt, and authentication is handled via secure JWT tokens. We never store plain text passwords."
        },
        {
            question: "What's the difference between uses and unlimited licenses?",
            answer: "You can set a specific number of uses for each license. Setting uses to 0 creates an unlimited license that can be validated any number of times."
        }
    ];

    return (
        <div>
            {faqs.map((faq, index) => (
                <div key={index} className="faq-item">
                    <h4 className="faq-question">Q: {faq.question}</h4>
                    <p className="faq-answer">A: {faq.answer}</p>
                </div>
            ))}
        </div>
    );
}

export default FAQ;
