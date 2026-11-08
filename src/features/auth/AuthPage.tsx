import AuthGateway from "./components/AuthGateway";

export function AuthPage({
  logo,
  siteName,
}: {
  logo?: string | null;
  siteName?: string;
}) {
  return (
    <main className="py-6 sm:py-10">
      <AuthGateway logo={logo} siteName={siteName} />
    </main>
  );
}
