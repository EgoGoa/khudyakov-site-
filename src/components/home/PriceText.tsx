// Цена тарифа: цифры — градиентом в тон рамке пилюли (см. .tier-price-digits
// в globals.css), остальной текст белый. Делит строку по группам цифр, так что
// «от 25 000 ₽» и «50 000–150 000 ₽/мес» выглядят одинаково.
export default function PriceText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\d[\d\s]*\d|\d)/).map((part, k) =>
        /\d/.test(part) ? (
          <span key={k} className="tier-price-digits">{part}</span>
        ) : (
          <span key={k}>{part}</span>
        ),
      )}
    </>
  );
}
