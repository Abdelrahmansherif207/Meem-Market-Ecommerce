export default function SectionTitle({ title }: { title: string }) {
  return (
    <h3 className="font-heading font-bold text-xl md:text-2xl mb-4 cursor-default tracking-tight">
      {title}
    </h3>
  );
}
