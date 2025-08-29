import ChatBox from '@/components/ChatBox';
import PasskeyButtons from '@/components/PasskeyButtons';

export default function ChatPage() {
  // Replace this with your actual user ID logic
  const userId = 'demo-user-001';

  return (
    <main className="max-w-xl mx-auto py-10 px-4 space-y-8">
      <h1 className="text-2xl font-bold">🔐 Secure Chat</h1>

      <section>
        <h2 className="text-lg font-semibold mb-2">Passkey Authentication</h2>
        <PasskeyButtons userId={userId} />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Messaging</h2>
        <ChatBox />
      </section>
    </main>
  );
}