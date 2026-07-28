import { getTranslations } from "next-intl/server";
import { FastShippingCartContent } from "./FastShippingCartContent";

interface FastShippingCartProps {
  locale: string;
}

export async function FastShippingCart({ locale }: FastShippingCartProps) {
  const t = await getTranslations({ locale, namespace: "cartPage" });

  return (
    <div className="py-6 min-h-screen">
      <FastShippingCartContent
        items={[]}
        onUpdateQuantity={() => {}}
        onRemove={() => {}}
      />
    </div>
  );
}
