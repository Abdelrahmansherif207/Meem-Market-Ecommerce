import AuthGateway from "./components/AuthGateway";

export function AuthPage({ logo }: { logo?: string | null }) {
  return (
    <main className="py-6 sm:py-10">
      <AuthGateway logo={logo} />
    </main>
  );
}