import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import ChatBox from '@/components/ChatBox';
import PasskeyButtons from '@/components/PasskeyButtons';
export default function ChatPage() {
    // Replace this with your actual user ID logic
    const userId = 'demo-user-001';
    return (_jsxs("main", { className: "max-w-xl mx-auto py-10 px-4 space-y-8", children: [_jsx("h1", { className: "text-2xl font-bold", children: "\uD83D\uDD10 Secure Chat" }), _jsxs("section", { children: [_jsx("h2", { className: "text-lg font-semibold mb-2", children: "Passkey Authentication" }), _jsx(PasskeyButtons, { userId: userId })] }), _jsxs("section", { children: [_jsx("h2", { className: "text-lg font-semibold mb-2", children: "Messaging" }), _jsx(ChatBox, {})] })] }));
}
//# sourceMappingURL=page.js.map