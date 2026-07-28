import type { InfoPage } from "../types";

// All footer page slugs and their content (production-grade)
const pageContents: Record<string, { en: InfoPage; ar: InfoPage }> = {
  "about": {
    en: {
      title: "About Kareem Shop",
      slug: "about",
      sections: [
        { type: "text", title: "Our Story", content: "<p>Kareem Shop started as a simple idea: to make authentic beauty and personal care products accessible to everyone in Egypt. What began as a small online store has grown into one of the country's most trusted e-commerce destinations for beauty enthusiasts.</p><p>Founded in 2015, Kareem Shop has since partnered with over 500 local and international brands to offer a curated selection of cosmetics, skincare, fragrances, haircare, and personal care essentials. From luxury brands to affordable everyday essentials, we cater to every budget and preference.</p>" },
        { type: "image", src: "https://placehold.co/1200x600/EEE/999?text=Kareem+Shop+Team" },
        { type: "text", title: "Why Shop With Us?", content: "<ul><li><strong>100% Authentic Products:</strong> Every product is sourced directly from authorized distributors and brands</li><li><strong>Competitive Prices:</strong> We offer the best prices in the market, backed by our price match guarantee</li><li><strong>Fast Delivery:</strong> Get your orders delivered within 1-7 business days across Egypt</li><li><strong>Easy Returns:</strong> 14-day return policy with free pickup for eligible items</li><li><strong>Dedicated Support:</strong> Our customer service team is available Sunday to Thursday, 9 AM to 9 PM</li></ul>" },
        { type: "text", title: "Our Vision", content: "<p>To become the most trusted and loved beauty e-commerce platform in the Middle East and North Africa, empowering individuals to express their unique beauty with confidence.</p>" }
      ]
    },
    ar: {
      title: "عن كريم شوب",
      slug: "about",
      sections: [
        { type: "text", title: "قصتنا", content: "<p>بدأت كريم شوب كفكرة بسيطة: جعل منتجات التجميل والعناية الشخصية الأصلية في متناول الجميع في مصر. ما بدأ كمتجر صغير عبر الإنترنت نما ليصبح واحداً من أكثر وجهات التجارة الإلكترونية الموثوقة في مصر لعشاق الجمال.</p><p>تأسست كريم شوب في عام 2015، ومنذ ذلك الحين تعاونت مع أكثر من 500 علامة تجارية محلية وعالمية لتقديم مجموعة منتقاة من مستحضرات التجميل والعناية بالبشرة والعطور.</p>" },
        { type: "image", src: "https://placehold.co/1200x600/EEE/999?text=فريق+كريم+شوب" },
        { type: "text", title: "لماذا تتسوق معنا؟", content: "<ul><li><strong>منتجات أصلية 100%:</strong> جميع المنتجات من موزعين معتمدين</li><li><strong>أسعار تنافسية:</strong> أفضل الأسعار في السوق</li><li><strong>توصيل سريع:</strong> استلام الطلب خلال 1-7 أيام عمل</li><li><strong>إرجاع سهل:</strong> سياسة إرجاع لمدة 14 يوماً</li><li><strong>دعم مخصص:</strong> فريق خدمة العملاء متاح الأحد إلى الخميس</li></ul>" },
        { type: "text", title: "رؤيتنا", content: "<p>أن نصبح منصة التجميل الإلكترونية الأكثر ثقة في الشرق الأوسط وشمال أفريقيا.</p>" }
      ]
    }
  },
  "anti-fraud": {
    en: {
      title: "Anti-Fraud Policy",
      slug: "anti-fraud",
      sections: [
        { type: "text", title: "Our Commitment to Security", content: "<p>Kareem Shop is committed to protecting our customers and our business from fraudulent activities. We employ advanced security measures and verification procedures to detect and prevent fraud.</p><h3>Fraud Prevention Measures</h3><ul><li><strong>Order Verification:</strong> We may verify high-value or suspicious orders via phone call before processing</li><li><strong>Address Verification:</strong> Orders are shipped only to verified addresses matching the billing or registered address</li><li><strong>Payment Security:</strong> All payment transactions are encrypted and processed through secure, PCI-compliant gateways</li><li><strong>Account Monitoring:</strong> Suspicious account activity is monitored and may result in account suspension</li></ul>" },
        { type: "text", title: "Reporting Fraud", content: "<p>If you suspect fraudulent activity on your account or unauthorized use of your payment method, please contact us immediately at <strong>16061</strong> or email <strong>security@kareemshop.com</strong>. We take all reports seriously and will investigate promptly.</p><h3>Consequences of Fraud</h3><p>Fraudulent activities, including but not limited to using stolen payment methods, providing false information, or attempting to deceive our systems, will result in:</p><ul><li>Immediate cancellation of orders</li><li>Permanent account suspension</li><li>Reporting to relevant authorities</li><li>Legal action where applicable</li></ul>" }
      ]
    },
    ar: {
      title: "سياسة مكافحة الاحتيال",
      slug: "anti-fraud",
      sections: [
        { type: "text", title: "التزامنا بالأمان", content: "<p>كريم شوب ملتزمة بحماية عملائنا وأعمالنا من الأنشطة الاحتيالية. نستخدم إجراءات أمنية متقدمة للكشف عن الاحتيال ومنعه.</p><h3>إجراءات منع الاحتيال</h3><ul><li><strong>التحقق من الطلب:</strong> قد نتحقق من الطلبات عالية القيمة عبر الهاتف</li><li><strong>التحقق من العنوان:</strong> يتم الشحن فقط إلى العناوين الموثقة</li><li><strong>أمان الدفع:</strong> جميع معاملات الدفع مشفرة وآمنة</li><li><strong>مراقبة الحساب:</strong> يتم مراقبة النشاط المشبوه</li></ul>" },
        { type: "text", title: "الإبلاغ عن الاحتيال", content: "<p>إذا اشتبهت في وجود نشاط احتيالي على حسابك، يرجى الاتصال بنا فوراً على <strong>16061</strong>. نأخذ جميع البلاغات على محمل الجد ونتحقق منها فوراً.</p>" }
      ]
    }
  },
  "cash-on-delivery": {
    en: {
      title: "Cash on Delivery",
      slug: "cash-on-delivery",
      sections: [
        { type: "text", title: "What is Cash on Delivery?", content: "<p>Cash on Delivery (COD) is a convenient payment method that allows you to pay for your order in cash when it arrives at your doorstep. No prepayment is required, giving you peace of mind and complete control over your purchase.</p><h3>How It Works</h3><ol><li>Select Cash on Delivery as your payment method at checkout</li><li>Place your order as usual</li><li>Receive your order at your doorstep</li><li>Pay the total amount in cash to the delivery agent</li></ol>" },
        { type: "text", title: "Important Information", content: "<ul><li><strong>Availability:</strong> COD is available in most areas across Egypt. Some remote areas may not be eligible.</li><li><strong>Fees:</strong> A nominal handling fee of EGP 10-20 may apply depending on the order value and location.</li><li><strong>Maximum Order Value:</strong> Orders up to EGP 10,000 are eligible for COD payment.</li><li><strong>Order Confirmation:</strong> You may receive a verification call to confirm your order before dispatch.</li></ul>" }
      ]
    },
    ar: {
      title: "الدفع عند الاستلام",
      slug: "cash-on-delivery",
      sections: [
        { type: "text", title: "ما هو الدفع عند الاستلام؟", content: "<p>الدفع عند الاستلام هو طريقة دفع مريحة تسمح لك بدفع قيمة طلبك نقداً عند وصوله إلى باب منزلك. لا حاجة للدفع المسبق، مما يمنحك راحة البال والتحكم الكامل في مشترياتك.</p><h3>كيف يعمل</h3><ol><li>اختر الدفع عند الاستلام كطريقة دفع أثناء إتمام الشراء</li><li>قم بتقديم طلبك كالمعتاد</li><li>استلم طلبك عند باب منزلك</li><li>ادفع المبلغ الإجمالي نقداً لمندوب التوصيل</li></ol>" },
        { type: "text", title: "معلومات مهمة", content: "<ul><li><strong>التوفر:</strong> متوفر في معظم مناطق مصر</li><li><strong>الرسوم:</strong> رسوم خدمة رمزية من 10-20 جنيهاً مصرياً</li><li><strong>الحد الأقصى للطلب:</strong> طلبات حتى 10,000 جنيه</li><li><strong>تأكيد الطلب:</strong> قد تتلقى اتصالاً للتحقق من طلبك قبل الشحن</li></ul>" }
      ]
    }
  },
  "community": {
    en: {
      title: "Community and Society",
      slug: "community",
      sections: [
        { type: "text", title: "Our Community Commitment", content: "<p>At Kareem Shop, we believe in the power of community. We are committed to making a positive impact on the communities we serve through various social initiatives and sustainable practices.</p><h3>Our Initiatives</h3><ul><li><strong>Supporting Local Artisans:</strong> We partner with local Egyptian artisans and small businesses, providing them with a platform to showcase their products to a wider audience</li><li><strong>Sustainability:</strong> We are working towards reducing our environmental footprint through eco-friendly packaging, waste reduction programs, and responsible sourcing</li><li><strong>Community Education:</strong> We organize workshops and awareness campaigns on beauty, skincare, and personal care to educate and empower our community</li><li><strong>Charitable Partnerships:</strong> We collaborate with charitable organizations to support those in need, particularly during Ramadan and other special occasions</li></ul>" },
        { type: "text", title: "Join Us", content: "<p>We invite our customers and partners to join us in our community initiatives. Together, we can make a difference. Follow us on social media to stay updated on our latest community projects and events.</p>" }
      ]
    },
    ar: {
      title: "المسؤولية المجتمعية",
      slug: "community",
      sections: [
        { type: "text", title: "التزامنا المجتمعي", content: "<p>في كريم شوب، نؤمن بقوة المجتمع. نحن ملتزمون بإحداث تأثير إيجابي في المجتمعات التي نخدمها من خلال المبادرات الاجتماعية المختلفة والممارسات المستدامة.</p><h3>مبادراتنا</h3><ul><li><strong>دعم الحرفيين المحليين:</strong> نتعاون مع الحرفيين المصريين والشركات الصغيرة لتوفير منصة لعرض منتجاتهم</li><li><strong>الاستدامة:</strong> نعمل على تقليل بصمتنا البيئية من خلال التغليف الصديق للبيئة</li><li><strong>التثقيف المجتمعي:</strong> ننظم ورش عمل وحملات توعوية حول التجميل والعناية بالبشرة</li><li><strong>الشراكات الخيرية:</strong> نتعاون مع المنظمات الخيرية لدعم المحتاجين</li></ul>" },
        { type: "text", title: "انضم إلينا", content: "<p>ندعو عملائنا وشركائنا للانضمام إلينا في مبادراتنا المجتمعية. معاً، يمكننا إحداث فرق. تابعونا على وسائل التواصل الاجتماعي للاطلاع على أحدث مشاريعنا المجتمعية.</p>" }
      ]
    }
  },
  "company": {
    en: {
      title: "Our Company",
      slug: "company",
      sections: [
        { type: "text", title: "About Kareem Shop", content: "<p>Kareem Shop is a leading Egyptian e-commerce platform specializing in beauty, personal care, and lifestyle products. Founded with a passion for quality and customer satisfaction, we have grown to become one of the most trusted online destinations for authentic beauty products in Egypt.</p><p>Our platform offers thousands of products from over 500 international and local brands, all carefully curated to meet the diverse needs of our customers. From premium cosmetics and skincare to fragrances and grooming essentials, we bring the best of beauty to your doorstep.</p>" },
        { type: "text", title: "Our Mission", content: "<p>Our mission is to make beauty accessible to everyone. We believe that everyone deserves to look and feel their best, which is why we are committed to offering authentic products at competitive prices, backed by exceptional customer service and fast, reliable delivery.</p>" },
        { type: "text", title: "Our Values", content: "<ul><li><strong>Authenticity:</strong> Every product we sell is 100% genuine and sourced directly from authorized distributors</li><li><strong>Customer First:</strong> Your satisfaction is at the heart of everything we do</li><li><strong>Innovation:</strong> We continuously evolve to bring you the latest trends and products</li><li><strong>Integrity:</strong> We conduct our business with honesty, transparency, and respect</li></ul>" }
      ]
    },
    ar: {
      title: "شركتنا",
      slug: "company",
      sections: [
        { type: "text", title: "عن كريم شوب", content: "<p>كريم شوب هي منصة تجارة إلكترونية مصرية رائدة متخصصة في منتجات التجميل والعناية الشخصية ومنتجات نمط الحياة. تأسست بشغف بالجودة ورضا العملاء، ونمت لتصبح واحدة من أكثر الوجهات الموثوقة عبر الإنترنت للمنتجات الأصلية في مصر.</p><p>نقدم آلاف المنتجات من أكثر من 500 علامة تجارية عالمية ومحلية، تم اختيارها بعناية لتلبية الاحتياجات المتنوعة لعملائنا.</p>" },
        { type: "text", title: "مهمتنا", content: "<p>مهمتنا هي جعل الجمال في متناول الجميع. نعتقد أن الجميع يستحق أن يبدو ويشعر بأفضل حال، ولهذا نحن ملتزمون بتقديم منتجات أصلية بأسعار تنافسية.</p>" },
        { type: "text", title: "قيمنا", content: "<ul><li><strong>الأصالة:</strong> كل منتج نبيعه أصلي 100% ومصدره موزعون معتمدون</li><li><strong>العميل أولاً:</strong> رضاك هو جوهر كل ما نقوم به</li><li><strong>الابتكار:</strong> نتطور باستمرار لنقدم لك أحدث المنتجات</li><li><strong>النزاهة:</strong> نتعامل بشفافية واحترام</li></ul>" }
      ]
    }
  },
  "contact": {
    en: {
      title: "Contact Us",
      slug: "contact",
      sections: [
        { type: "text", title: "We Are Here to Help", content: "<p>Have a question, concern, or feedback? We would love to hear from you. Our customer service team is available to assist you with any inquiries.</p><h3>Customer Service</h3><ul><li><strong>Phone:</strong> 16061 (Sunday to Thursday, 9:00 AM - 9:00 PM)</li><li><strong>Email:</strong> info@kareemshop.com</li></ul><h3>Corporate Office</h3><p>Kareem Shop Egypt<br>5 Al Morshedi Street, Al Maza<br>Heliopolis, Cairo, Egypt</p>" },
        { type: "image", src: "https://placehold.co/800x400/EEE/999?text=Map+-+Kareem+Shop+Location" },
        { type: "text", title: "Working Hours", content: "<p><strong>Customer Service:</strong> Sunday to Thursday, 9:00 AM - 9:00 PM</p><p><strong>Store Pickup:</strong> Sunday to Thursday, 10:00 AM - 8:00 PM</p><p><strong>Friday & Saturday:</strong> Closed</p><p>Emails and online inquiries will be responded to within 24 hours during business days.</p>" }
      ]
    },
    ar: {
      title: "اتصل بنا",
      slug: "contact",
      sections: [
        { type: "text", title: "نحن هنا لمساعدتك", content: "<p>هل لديك سؤال أو استفسار أو ملاحظة؟ يسعدنا سماعك. فريق خدمة العملاء لدينا متاح لمساعدتك.</p><h3>خدمة العملاء</h3><ul><li><strong>الهاتف:</strong> 16061 (الأحد إلى الخميس، 9:00 ص - 9:00 م)</li><li><strong>البريد الإلكتروني:</strong> info@kareemshop.com</li></ul><h3>المكتب الرئيسي</h3><p>كريم شوب مصر<br>5 شارع المرشدي، الماظة<br>مصر الجديدة، القاهرة، مصر</p>" },
        { type: "image", src: "https://placehold.co/800x400/EEE/999?text=خريطة+-+موقع+كريم+شوب" },
        { type: "text", title: "ساعات العمل", content: "<p><strong>خدمة العملاء:</strong> الأحد إلى الخميس، 9:00 ص - 9:00 م</p><p><strong>استلام الطلبات:</strong> الأحد إلى الخميس، 10:00 ص - 8:00 م</p><p><strong>الجمعة والسبت:</strong> مغلق</p>" }
      ]
    }
  },
  "disclosure": {
    en: {
      title: "Legal Disclosure",
      slug: "disclosure",
      sections: [
        { type: "text", title: "Company Information", content: "<p>In compliance with Egyptian e-commerce regulations, the following information is provided for legal and regulatory purposes.</p><h3>Company Details</h3><ul><li><strong>Legal Name:</strong> Kareem Shop for E-Commerce LLC</li><li><strong>Commercial Registration:</strong> 123456789</li><li><strong>Tax ID:</strong> 987-654-321</li><li><strong>Registered Address:</strong> 5 Al Morshedi Street, Al Maza, Heliopolis, Cairo, Egypt</li></ul><h3>Contact Information</h3><ul><li><strong>Phone:</strong> 16061</li><li><strong>Email:</strong> legal@kareemshop.com</li></ul><h3>Regulatory Compliance</h3><p>Kareem Shop operates in full compliance with Egyptian consumer protection laws, e-commerce regulations, and data privacy laws. All products sold on our platform meet the quality and safety standards set by the Egyptian Organization for Standardization and Quality.</p>" }
      ]
    },
    ar: {
      title: "الإفصاح القانوني",
      slug: "disclosure",
      sections: [
        { type: "text", title: "معلومات الشركة", content: "<p>امتثالاً للوائح التجارة الإلكترونية المصرية، يتم توفير المعلومات التالية للأغراض القانونية والتنظيمية.</p><h3>بيانات الشركة</h3><ul><li><strong>الاسم القانوني:</strong> كريم شوب للتجارة الإلكترونية</li><li><strong>السجل التجاري:</strong> 123456789</li><li><strong>الرقم الضريبي:</strong> 987-654-321</li><li><strong>العنوان المسجل:</strong> 5 شارع المرشدي، الماظة، مصر الجديدة، القاهرة</li></ul><h3>معلومات الاتصال</h3><ul><li><strong>الهاتف:</strong> 16061</li><li><strong>البريد الإلكتروني:</strong> legal@kareemshop.com</li></ul>" }
      ]
    }
  },
  "extended-warranty": {
    en: {
      title: "Extended Warranty Program",
      slug: "extended-warranty",
      sections: [
        { type: "text", title: "Protect Your Purchase", content: "<p>Extend the life of your favorite products with the Kareem Shop Extended Warranty Program. For a small additional fee, you can double or triple the manufacturer's warranty on eligible items, giving you extra peace of mind.</p><h3>Coverage Details</h3><ul><li><strong>Duration:</strong> Choose between 1, 2, or 3 additional years of coverage</li><li><strong>What's Covered:</strong> Manufacturing defects, normal wear and tear, battery degradation (for electronics), and mechanical failures</li><li><strong>What's Not Covered:</strong> Accidental damage, misuse, unauthorized repairs, or loss/theft</li></ul>" },
        { type: "text", title: "How to Purchase", content: "<p>Extended warranty can be added during checkout for eligible products. Simply select the warranty option when adding items to your cart. You will receive a warranty certificate via email within 48 hours of purchase.</p><p>To make a claim, contact our customer service team at <strong>16061</strong> or email us at warranty@kareemshop.com with your order number and warranty certificate.</p>" }
      ]
    },
    ar: {
      title: "برنامج الضمان الممتد",
      slug: "extended-warranty",
      sections: [
        { type: "text", title: "احم مشترياتك", content: "<p>أطِل عمر منتجاتك المفضلة مع برنامج الضمان الممتد من كريم شوب. مقابل رسوم إضافية بسيطة، يمكنك مضاعفة الضمان على المنتجات المؤهلة.</p><h3>تفاصيل التغطية</h3><ul><li><strong>المدة:</strong> اختر سنة أو سنتين أو 3 سنوات إضافية</li><li><strong>المشمول:</strong> عيوب التصنيع، التآكل الطبيعي، تدهور البطارية (للإلكترونيات)، الأعطال الميكانيكية</li><li><strong>غير المشمول:</strong> الضرر العرضي، سوء الاستخدام، الإصلاحات غير المصرح بها</li></ul>" },
        { type: "text", title: "كيفية الشراء", content: "<p>يمكن إضافة الضمان الممتد أثناء إتمام الشراء للمنتجات المؤهلة. ستتلقى شهادة الضمان عبر البريد الإلكتروني في غضون 48 ساعة من الشراء.</p><p>لتقديم مطالبة، اتصل بفريق خدمة العملاء على <strong>16061</strong>.</p>" }
      ]
    }
  },
  "faq": {
    en: {
      title: "Frequently Asked Questions",
      slug: "faq",
      sections: [
        { type: "text", title: "Orders & Payment", content: "<h3>How do I place an order?</h3><p>Simply browse our website, add desired items to your cart, and proceed to checkout. Follow the steps to enter your shipping details and choose a payment method.</p><h3>Can I modify or cancel my order?</h3><p>You can cancel your order within 1 hour of placing it. Modifications may be possible if the order has not yet been processed. Contact our customer service team at 16061 for assistance.</p><h3>What payment methods do you accept?</h3><p>We accept credit/debit cards (Visa, MasterCard, American Express), Cash on Delivery, bank transfers, and digital wallets (Apple Pay, Google Pay).</p><h3>Is my payment information secure?</h3><p>Yes. All transactions are encrypted and processed through secure, PCI DSS compliant payment gateways. Your financial data is never stored on our servers.</p>" },
        { type: "text", title: "Shipping & Delivery", content: "<h3>How long does delivery take?</h3><p>Standard delivery takes 3-7 business days. Express delivery takes 1-2 business days. Same-day delivery is available in select areas.</p><h3>Do you ship internationally?</h3><p>Currently, we only ship within Egypt. We hope to expand internationally in the future.</p><h3>How can I track my order?</h3><p>Once your order is dispatched, you will receive a tracking number via email and SMS. You can also track your order from the \"My Orders\" section in your account.</p>" },
        { type: "text", title: "Returns & Refunds", content: "<h3>Can I return a product?</h3><p>Yes. You can return most products within 14 days of delivery. Please refer to our Returns Policy for detailed information on eligibility and process.</p><h3>How long do refunds take?</h3><p>Refunds are processed within 5-10 business days after we receive the returned item. The refund will be issued to your original payment method.</p>" }
      ]
    },
    ar: {
      title: "الأسئلة الشائعة",
      slug: "faq",
      sections: [
        { type: "text", title: "الطلبات والدفع", content: "<h3>كيف أقدم طلباً؟</h3><p>تصفح موقعنا، أضف المنتجات إلى سلة التسوق، وتابع إلى إتمام الشراء. اتبع الخطوات لإدخال بيانات الشحن واختيار طريقة الدفع.</p><h3>هل يمكنني تعديل أو إلغاء طلبي؟</h3><p>يمكنك إلغاء طلبك خلال ساعة من تقديمه. اتصل بخدمة العملاء على 16061 للمساعدة.</p><h3>ما طرق الدفع المتاحة؟</h3><p>بطاقات الائتمان/الخصم (فيزا، ماستركارد)، الدفع عند الاستلام، التحويل البنكي، المحافظ الرقمية (Apple Pay، Google Pay).</p><h3>هل معلومات الدفع آمنة؟</h3><p>نعم. جميع المعاملات مشفرة وآمنة ومتوافقة مع معايير PCI DSS.</p>" },
        { type: "text", title: "الشحن والتوصيل", content: "<h3>كم تستغرق مدة التوصيل؟</h3><p>التوصيل القياسي: 3-7 أيام عمل. التوصيل السريع: 1-2 يوم عمل. التوصيل في نفس اليوم متاح في مناطق محددة.</p><h3>هل تشحنون دولياً؟</h3><p>حالياً، نشحن داخل مصر فقط.</p><h3>كيف أتتبع طلبي؟</h3><p>ستتلقى رقم تتبع عبر البريد الإلكتروني والرسائل النصية بعد الشحن.</p>" },
        { type: "text", title: "الإرجاع والاسترداد", content: "<h3>هل يمكنني إرجاع منتج؟</h3><p>نعم. يمكنك إرجاع معظم المنتجات خلال 14 يوماً من التوصيل.</p><h3>كم تستغرق المبالغ المستردة؟</h3><p>تتم معالجة المبالغ المستردة في غضون 5-10 أيام عمل بعد استلام المنتج المرتجع.</p>" }
      ]
    }
  },
  "loyalty": {
    en: {
      title: "Loyalty Program",
      slug: "loyalty",
      sections: [
        { type: "text", title: "Kareem Rewards Program", content: "<p>Welcome to Kareem Rewards — our exclusive loyalty program designed to thank you for your continued trust and support. Earn points with every purchase and redeem them for discounts, free products, and exclusive perks.</p><h3>How It Works</h3><ol><li><strong>Sign Up:</strong> Create a free Kareem Shop account and automatically join the rewards program</li><li><strong>Earn Points:</strong> Earn 1 point for every EGP 10 spent. Bonus points available on selected products and special promotions</li><li><strong>Redeem:</strong> Exchange 100 points for EGP 10 discount on your next purchase</li></ol>" },
        { type: "text", title: "Membership Tiers", content: "<h3>Silver (0-500 points)</h3><ul><li>1 point per EGP 10 spent</li><li>Birthday bonus: 50 points</li></ul><h3>Gold (501-1500 points)</h3><ul><li>1.5 points per EGP 10 spent</li><li>Birthday bonus: 100 points</li><li>Free standard shipping on all orders</li></ul><h3>Platinum (1500+ points)</h3><ul><li>2 points per EGP 10 spent</li><li>Birthday bonus: 200 points</li><li>Free express shipping on all orders</li><li>Early access to sales and new collections</li></ul>" }
      ]
    },
    ar: {
      title: "برنامج المكافآت",
      slug: "loyalty",
      sections: [
        { type: "text", title: "برنامج مكافآت كريم", content: "<p>مرحباً بك في مكافآت كريم — برنامج الولاء الحصري المصمم لشكرك على ثقتك ودعمك المستمر. اربح نقاطاً مع كل عملية شراء واستبدلها بخصومات ومنتجات مجانية ومزايا حصرية.</p><h3>كيف يعمل</h3><ol><li><strong>التسجيل:</strong> أنشئ حساباً مجاناً في كريم شوب وانضم تلقائياً</li><li><strong>اكسب النقاط:</strong> اربح نقطة واحدة لكل 10 جنيهات إنفاق</li><li><strong>الاستبدال:</strong> استبدل 100 نقطة بخصم 10 جنيهات على مشترياتك القادمة</li></ol>" },
        { type: "text", title: "مستويات العضوية", content: "<h3>فضي (0-500 نقطة)</h3><ul><li>نقطة لكل 10 جنيهات</li><li>مكافأة عيد الميلاد: 50 نقطة</li></ul><h3>ذهبي (501-1500 نقطة)</h3><ul><li>1.5 نقطة لكل 10 جنيهات</li><li>مكافأة عيد الميلاد: 100 نقطة</li><li>شحن قياسي مجاني</li></ul><h3>بلاتيني (1500+ نقطة)</h3><ul><li>نقطتان لكل 10 جنيهات</li><li>مكافأة عيد الميلاد: 200 نقطة</li><li>شحن سريع مجاني</li><li>وصول مبكر للتخفيضات</li></ul>" }
      ]
    }
  },
  "newsletter": {
    en: {
      title: "Newsletter",
      slug: "newsletter",
      sections: [
        { type: "text", title: "Subscribe to Our Newsletter", content: "<p>Stay up to date with the latest products, exclusive offers, beauty tips, and more. Subscribe to the Kareem Shop newsletter and never miss out on great deals!</p><h3>Benefits of Subscribing</h3><ul><li><strong>Exclusive Discounts:</strong> Receive subscriber-only promo codes and special offers</li><li><strong>Early Access:</strong> Be the first to know about new product launches and flash sales</li><li><strong>Beauty Tips:</strong> Get expert advice on skincare routines, makeup tutorials, and product recommendations</li><li><strong>Personalized Recommendations:</strong> Receive product suggestions tailored to your preferences and purchase history</li></ul><p>You can unsubscribe at any time. We respect your privacy and will never share your email with third parties.</p>" }
      ]
    },
    ar: {
      title: "النشرة البريدية",
      slug: "newsletter",
      sections: [
        { type: "text", title: "اشترك في نشرتنا البريدية", content: "<p>ابق على اطلاع بأحدث المنتجات والعروض الحصرية ونصائح الجمال. اشترك في النشرة البريدية لكريم شوب ولا تفوت العروض الرائعة!</p><h3>مزايا الاشتراك</h3><ul><li><strong>خصومات حصرية:</strong> احصل على رموز ترويجية وعروض خاصة للمشتركين فقط</li><li><strong>وصول مبكر:</strong> كن أول من يعرف عن إطلاق المنتجات الجديدة والتخفيضات السريعة</li><li><strong>نصائح الجمال:</strong> احصل على نصائح الخبراء حول العناية بالبشرة والمكياج</li><li><strong>توصيات مخصصة:</strong> اقتراحات منتجات مصممة حسب تفضيلاتك</li></ul><p>يمكنك إلغاء الاشتراك في أي وقت. نحن نحترم خصوصيتك ولن نشارك بريدك الإلكتروني مع أطراف ثالثة.</p>" }
      ]
    }
  },
  "payment": {
    en: {
      title: "Secured Online Payment",
      slug: "payment",
      sections: [
        { type: "text", title: "Payment Methods", content: "<p>We offer a wide range of secure payment methods for your convenience. All transactions are processed through encrypted connections and your financial information is never stored on our servers.</p><ul><li><strong>Credit and Debit Cards:</strong> We accept Visa, MasterCard, and American Express. Your card details are encrypted using industry-standard SSL technology.</li><li><strong>Cash on Delivery:</strong> Pay in cash when your order arrives. Available for most areas with a nominal fee.</li><li><strong>Bank Transfer:</strong> Direct transfer to our bank account. Orders are processed once payment is confirmed.</li><li><strong>Digital Wallets:</strong> Apple Pay, Google Pay, and other digital wallet options available at checkout.</li></ul>" },
        { type: "text", title: "Security", content: "<p>At Kareem Shop, we take payment security seriously. Our payment gateway is PCI DSS compliant, ensuring that your payment data is handled according to the highest security standards. We employ advanced encryption, fraud monitoring, and secure tokenization to protect every transaction.</p><p>Your trust is important to us. If you notice any unauthorized transactions, please contact us immediately at <strong>16061</strong>.</p>" }
      ]
    },
    ar: {
      title: "الدفع الآمن عبر الإنترنت",
      slug: "payment",
      sections: [
        { type: "text", title: "طرق الدفع", content: "<p>نقدم مجموعة واسعة من طرق الدفع الآمنة لراحتك. جميع المعاملات مشفرة ومؤمنة.</p><ul><li><strong>بطاقات الائتمان والخصم:</strong> فيزا، ماستركارد، وأمريكان إكسبريس</li><li><strong>الدفع عند الاستلام:</strong> ادفع نقداً عند وصول طلبك</li><li><strong>التحويل البنكي:</strong> تحويل مباشر إلى حسابنا البنكي</li><li><strong>المحافظ الرقمية:</strong> Apple Pay، Google Pay، وخيارات أخرى</li></ul>" },
        { type: "text", title: "الأمان", content: "<p>في كريم شوب، نأخذ أمان الدفع على محمل الجد. بوابة الدفع الخاصة بنا متوافقة مع PCI DSS، مما يضمن معالجة بيانات الدفع حسب أعلى معايير الأمان.</p>" }
      ]
    }
  },
  "privacy": {
    en: {
      title: "Privacy Policy",
      slug: "privacy",
      sections: [
        { type: "text", title: "Introduction", content: "<p>At Kareem Shop, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you visit our website or make a purchase. Please read this policy carefully.</p><h3>Information We Collect</h3><p>We may collect the following types of information:</p><ul><li><strong>Personal Information:</strong> Name, email address, phone number, shipping/billing address, and payment information when you place an order</li><li><strong>Account Information:</strong> Username, password, order history, and preferences when you create an account</li><li><strong>Usage Data:</strong> IP address, browser type, device information, pages visited, and browsing behavior</li><li><strong>Cookies:</strong> We use cookies to enhance your browsing experience and analyze website traffic</li></ul><h3>How We Use Your Information</h3><ul><li>Process and fulfill your orders</li><li>Communicate with you about your orders and account</li><li>Send promotional offers and newsletters (with your consent)</li><li>Improve our website and services</li><li>Prevent fraud and ensure security</li><li>Comply with legal obligations</li></ul><h3>Information Sharing</h3><p>We do not sell your personal information to third parties. We may share your information with trusted service providers (such as payment processors and shipping companies) solely for the purpose of fulfilling your order. These partners are contractually obligated to protect your data.</p><h3>Data Security</h3><p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Our security practices include SSL encryption, secure servers, and regular security audits.</p><h3>Your Rights</h3><p>You have the right to access, correct, or delete your personal information at any time. You can manage your preferences through your account settings or contact us for assistance. You may also opt out of marketing communications at any time.</p><h3>Contact</h3><p>If you have questions about this Privacy Policy, please contact us at <strong>privacy@kareemshop.com</strong> or call <strong>16061</strong>.</p>" }
      ]
    },
    ar: {
      title: "سياسة الخصوصية",
      slug: "privacy",
      sections: [
        { type: "text", title: "مقدمة", content: "<p>في كريم شوب، نأخذ خصوصيتك على محمل الجد. تشرح سياسة الخصوصية هذه كيف نجمع ونستخدم ونحمي معلوماتك الشخصية عند زيارة موقعنا أو إجراء عملية شراء.</p><h3>المعلومات التي نجمعها</h3><ul><li><strong>المعلومات الشخصية:</strong> الاسم، البريد الإلكتروني، رقم الهاتف، عنوان الشحن، معلومات الدفع</li><li><strong>معلومات الحساب:</strong> اسم المستخدم، كلمة المرور، سجل الطلبات</li><li><strong>بيانات الاستخدام:</strong> عنوان IP، نوع المتصفح، الصفحات التي تمت زيارتها</li><li><strong>ملفات تعريف الارتباط:</strong> نستخدمها لتحسين تجربة التصفح</li></ul><h3>كيف نستخدم معلوماتك</h3><ul><li>معالجة وتنفيذ طلباتك</li><li>التواصل معك بخصوص طلباتك</li><li>إرسال العروض الترويجية (بموافقتك)</li><li>تحسين خدماتنا</li><li>منع الاحتيال</li></ul><h3>أمان البيانات</h3><p>نستخدم تدابير أمنية مناسبة لحماية معلوماتك الشخصية، بما في ذلك تشفير SSL والخوادم الآمنة.</p><h3>حقوقك</h3><p>لديك الحق في الوصول إلى معلوماتك الشخصية أو تصحيحها أو حذفها في أي وقت.</p>" }
      ]
    }
  },
  "returns": {
    en: {
      title: "Returns and Exchanges",
      slug: "returns",
      sections: [
        { type: "text", title: "Return Policy", content: "<p>Customer satisfaction is our top priority. You may return most items within 14 days of delivery for a full refund or exchange.</p><h3>Eligibility</h3><ul><li>Items must be unused and in original packaging with all tags intact</li><li>Return requests must be initiated within 14 calendar days of delivery</li><li>A valid order number is required</li><li>Clearance items and opened fragrances are final sale</li></ul><h3>Process</h3><ol><li>Contact customer service at <strong>16061</strong> or via WhatsApp</li><li>Receive a return authorization number and shipping instructions</li><li>Pack the item securely and ship using the provided return label</li><li>Refund processed within 5-7 business days after inspection</li></ol><h3>Refunds</h3><p>Refunds are credited to your original payment method. Original shipping charges are non-refundable. Return shipping is free for defective items.</p>" }
      ]
    },
    ar: {
      title: "الإرجاع والاستبدال",
      slug: "returns",
      sections: [
        { type: "text", title: "سياسة الإرجاع", content: "<p>رضا العملاء هو أولويتنا القصوى. يمكنك إرجاع معظم المنتجات خلال 14 يوماً من التوصيل.</p><h3>الشروط</h3><ul><li>يجب أن تكون المنتجات غير مستخدمة وفي عبواتها الأصلية</li><li>يجب تقديم طلب الإرجاع خلال 14 يوماً</li><li>رقم طلب صالح مطلوب</li></ul><h3>الإجراءات</h3><ol><li>اتصل بخدمة العملاء على 16061</li><li>استلم رقم تصريح الإرجاع</li><li>قم بشحن المنتج</li><li>سيتم الرد خلال 5-7 أيام</li></ol>" }
      ]
    }
  },
  "service-warranty": {
    en: {
      title: "Service and Warranty",
      slug: "service-warranty",
      sections: [
        { type: "text", title: "Warranty Coverage", content: "<p>All products purchased from Kareem Shop are covered by a comprehensive manufacturer warranty against defects in materials and workmanship. The warranty period and coverage terms vary depending on the product category.</p><ul><li><strong>Electronics and electrical appliances:</strong> Covered by a 1-year manufacturer warranty from the date of purchase</li><li><strong>Beauty and personal care devices:</strong> 6-month warranty covering manufacturing defects</li><li><strong>Fragrances and cosmetics:</strong> Guaranteed authentic and sealed. Claims for manufacturing defects accepted within 7 days of delivery</li></ul>" },
        { type: "text", title: "How to Claim", content: "<p>To initiate a warranty claim, please contact our customer service team at <strong>16061</strong> or via WhatsApp with your order number. Provide a detailed description of the issue and supporting evidence. Our team will evaluate your claim and provide instructions for returning the product if needed. Once the product is received and inspected, we will process the repair, replacement, or refund.</p>" },
        { type: "text", title: "Exclusions", content: "<p>The warranty does not cover normal wear and tear, damage caused by misuse or negligence, accessories such as batteries and cables, or products purchased from unauthorized resellers.</p><p>For any questions regarding warranty coverage, please contact our support team.</p>" }
      ]
    },
    ar: {
      title: "الخدمة والضمان",
      slug: "service-warranty",
      sections: [
        { type: "text", title: "تغطية الضمان", content: "<p>جميع المنتجات المشتراة من كريم شوب مشمولة بضمان شامل من الشركة المصنعة ضد عيوب المواد والصناعة.</p><ul><li><strong>الإلكترونيات والأجهزة:</strong> ضمان لمدة عام واحد</li><li><strong>أجهزة التجميل:</strong> ضمان 6 أشهر</li><li><strong>العطور ومستحضرات التجميل:</strong> مضمونة الأصالة</li></ul>" },
        { type: "text", title: "كيفية المطالبة", content: "<p>اتصل بفريق خدمة العملاء على <strong>16061</strong> مع رقم طلبك ووصف المشكلة.</p>" },
        { type: "text", title: "استثناءات", content: "<p>لا يغطي الضمان التأكل الطبيعي أو التلف الناتج عن سوء الاستخدام.</p>" }
      ]
    }
  },
  "shipping": {
    en: {
      title: "Shipping and Delivery",
      slug: "shipping",
      sections: [
        { type: "text", title: "Delivery Options", content: "<p>We offer fast and reliable shipping across all regions. Our goal is to get your order to you as quickly and safely as possible.</p><h3>Standard Delivery</h3><p><strong>Cost:</strong> Free for orders over EGP 500 | EGP 30 for orders under EGP 500</p><p><strong>Timeline:</strong> 3-7 business days</p><h3>Express Delivery</h3><p><strong>Cost:</strong> Flat rate EGP 50</p><p><strong>Timeline:</strong> 1-2 business days</p><h3>Same Day Delivery</h3><p><strong>Cost:</strong> EGP 80</p><p><strong>Timeline:</strong> Delivered within hours on the same day (available in select areas only)</p>" },
        { type: "text", title: "Order Processing", content: "<p>Orders placed before 2:00 PM on business days are processed and dispatched the same day. Orders placed after 2:00 PM or on weekends/holidays are processed the next business day.</p><p>You will receive a confirmation email with tracking information once your order is dispatched. Delivery times may vary depending on your location and external factors.</p>" }
      ]
    },
    ar: {
      title: "الشحن والتوصيل",
      slug: "shipping",
      sections: [
        { type: "text", title: "خيارات التوصيل", content: "<p>نقدم شحناً سريعاً وموثوقاً في جميع المناطق.</p><h3>التوصيل القياسي</h3><p><strong>التكلفة:</strong> مجاني للطلبات فوق 500 جنيه | 30 جنيه للطلبات أقل من 500 جنيه</p><p><strong>المدة:</strong> 3-7 أيام عمل</p><h3>التوصيل السريع</h3><p><strong>التكلفة:</strong> 50 جنيه (سعر ثابت)</p><p><strong>المدة:</strong> 1-2 يوم عمل</p>" },
        { type: "text", title: "معالجة الطلبات", content: "<p>يتم شحن الطلبات المقدمة قبل الساعة 2:00 مساءً في نفس اليوم. ستتلقى بريداً إلكترونياً بمعلومات التتبع بمجرد شحن طلبك.</p>" }
      ]
    }
  },
  "stores": {
    en: {
      title: "Our Stores",
      slug: "stores",
      sections: [
        { type: "text", title: "Find a Kareem Shop Near You", content: "<p>Visit our physical stores to experience our products in person. Our friendly staff is ready to assist you with product recommendations, skincare consultations, and more.</p><h3>Flagship Store</h3><p><strong>Address:</strong> 5 Al Morshedi Street, Al Maza, Heliopolis, Cairo<br><strong>Hours:</strong> Sunday to Thursday, 10:00 AM - 8:00 PM</p><h3>City Stars Mall Branch</h3><p><strong>Address:</strong> City Stars Mall, 1st Floor, Nasr City, Cairo<br><strong>Hours:</strong> Daily, 10:00 AM - 11:00 PM</p><h3>Mall of Arabia Branch</h3><p><strong>Address:</strong> Mall of Arabia, Ground Floor, Sheikh Zayed, Giza<br><strong>Hours:</strong> Daily, 10:00 AM - 11:00 PM</p><h3>San Stefano Mall Branch</h3><p><strong>Address:</strong> San Stefano Grand Plaza, Ground Floor, Alexandria<br><strong>Hours:</strong> Daily, 10:00 AM - 11:00 PM</p>" }
      ]
    },
    ar: {
      title: "فروعنا",
      slug: "stores",
      sections: [
        { type: "text", title: "اعثر على فرع كريم شوب بالقرب منك", content: "<p>قم بزيارة فروعنا الفعلية لتجربة منتجاتنا شخصياً. موظفونا المدربون جاهزون لمساعدتك.</p><h3>الفرع الرئيسي</h3><p><strong>العنوان:</strong> 5 شارع المرشدي، الماظة، مصر الجديدة، القاهرة<br><strong>المواعيد:</strong> الأحد إلى الخميس، 10:00 ص - 8:00 م</p><h3>فرع سيتي ستارز</h3><p><strong>العنوان:</strong> سيتي ستارز، الطابق الأول، مدينة نصر، القاهرة<br><strong>المواعيد:</strong> يومياً، 10:00 ص - 11:00 م</p><h3>فرع مول العرب</h3><p><strong>العنوان:</strong> مول العرب، الطابق الأرضي، الشيخ زايد، الجيزة<br><strong>المواعيد:</strong> يومياً، 10:00 ص - 11:00 م</p><h3>فرع سان ستيفانو</h3><p><strong>العنوان:</strong> سان ستيفانو جراند بلازا، الطابق الأرضي، الإسكندرية<br><strong>المواعيد:</strong> يومياً، 10:00 ص - 11:00 م</p>" }
      ]
    }
  },
  "terms": {
    en: {
      title: "Terms and Conditions",
      slug: "terms",
      sections: [
        { type: "text", title: "General Terms", content: "<p>Welcome to Kareem Shop. By accessing and using this website, you agree to comply with and be bound by the following terms and conditions. Please read them carefully before using our services.</p><h3>Use of the Website</h3><p>By using Kareem Shop, you confirm that you are at least 18 years old or are using the website under the supervision of a parent or guardian. You are responsible for maintaining the confidentiality of your account and password.</p><h3>Product Information</h3><p>We strive to display accurate product descriptions, images, and pricing. However, we do not guarantee that product descriptions or other content are error-free, complete, or current. We reserve the right to correct any errors and update information at any time.</p><h3>Pricing</h3><p>All prices are listed in Egyptian Pounds (EGP) and include applicable taxes. We reserve the right to modify prices at any time. Promotional codes and discounts are subject to specific terms and may not be combined.</p><h3>Order Acceptance</h3><p>We reserve the right to refuse or cancel any order for reasons including but not limited to product availability, pricing errors, or suspected fraud. If we cancel an order, we will issue a full refund.</p>" }
      ]
    },
    ar: {
      title: "الشروط والأحكام",
      slug: "terms",
      sections: [
        { type: "text", title: "الشروط العامة", content: "<p>مرحباً بك في كريم شوب. باستخدامك لهذا الموقع، فإنك توافق على الالتزام بالشروط والأحكام التالية. يرجى قراءتها بعناية.</p><h3>استخدام الموقع</h3><p>باستخدامك كريم شوب، فإنك تؤكد أنك تبلغ من العمر 18 عاماً على الأقل. أنت مسؤول عن الحفاظ على سرية حسابك وكلمة المرور الخاصة بك.</p><h3>معلومات المنتج</h3><p>نسعى لعرض أوصاف وصور دقيقة للمنتجات. لا نضمن أن تكون أوصاف المنتجات خالية من الأخطاء. نحتفظ بالحق في تصحيح أي أخطاء.</p><h3>التسعير</h3><p>جميع الأسعار بالجنيه المصري وتشمل الضرائب المطبقة. نحتفظ بالحق في تعديل الأسعار في أي وقت.</p><h3>قبول الطلب</h3><p>نحتفظ بالحق في رفض أو إلغاء أي طلب لأسباب تشمل توفر المنتج أو أخطاء التسعير أو الاشتباه في الاحتيال.</p>" }
      ]
    }
  }
};

export function getInfoPageContent(slug: string, locale: string): InfoPage | null {
  const page = pageContents[slug];
  if (!page) return null;
  return locale === "ar" ? page.ar : page.en;
}

export function getAllInfoPageSlugs(): string[] {
  return Object.keys(pageContents);
}