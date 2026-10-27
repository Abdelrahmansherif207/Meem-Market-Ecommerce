import type { InfoPage } from "../types";

/**
 * Static fallback content for /info/[slug] pages (en + ar).
 *
 * Brand: مصنع روض الأصيل للتعبئة والتغليف / Rawd Al-Aseel — a Saudi
 * packaging & industrial production factory that also operates an online
 * retail store. "about", "company" and "community" use the B2B factory
 * voice; the remaining pages use retail-store policy voice.
 *
 * NOTE: contact details below (phone numbers, emails, addresses) are
 * placeholders pending official brand data. At runtime, real values are
 * served by the backend when available.
 */

const pageContents: Record<string, { en: InfoPage; ar: InfoPage }> = {
  "about": {
    en: {
      title: "About Rawd Al-Aseel",
      slug: "about",
      sections: [
        { type: "text", content: "<p>Rawd Al-Aseel Packaging Factory is your trusted partner for integrated packaging and industrial production solutions tailored to the highest quality standards.</p>" },
        { type: "text", title: "About Us", content: "<h3>Our Story</h3><p>Rawd Al-Aseel started with a clear vision: providing professional packaging services that empower businesses and support diverse commercial sectors. What began as an ambitious manufacturing facility has grown into a highly trusted name in the industrial packaging and production market, driven by innovation and excellence.</p><h3>Our Vision</h3><p>To become the leading and most efficient packaging factory in the region, empowering brands to deliver their products safely, securely, and attractively to global markets.</p>" },
        { type: "text", title: "Why Choose Rawd Al-Aseel?", content: "<table><thead><tr><th>Advantage</th><th>Details</th></tr></thead><tbody><tr><td><strong>Guaranteed Production Quality</strong></td><td>We implement rigorous manufacturing standards to ensure the safety and integrity of every package.</td></tr><tr><td><strong>Customized & Integrated Solutions</strong></td><td>We provide tailored packaging services designed to meet the exact requirements of your business.</td></tr><tr><td><strong>Strict Timeline Commitment</strong></td><td>We guarantee seamless production cycles and on-time delivery for all order volumes.</td></tr><tr><td><strong>Competitive Pricing</strong></td><td>We offer cost-effective pricing structures optimized for bulk industrial manufacturing.</td></tr><tr><td><strong>Dedicated Technical Support</strong></td><td>Our support team is always available to assist with production updates and industrial inquiries.</td></tr></tbody></table>" }
      ]
    },
    ar: {
      title: "عن روض الأصيل",
      slug: "about",
      sections: [
        { type: "text", content: "<p>مصنع روض الأصيل للتعبئة والتغليف؛ شريككم الموثوق في تقديم حلول التعبئة والإنتاج الصناعي المتكاملة بأعلى معايير الجودة.</p>" },
        { type: "text", title: "من نحن", content: "<h3>قصتنا</h3><p>بدأت مسيرة «روض الأصيل» برؤية واضحة ومحددة: تقديم خدمات تعبئة وتغليف احترافية تدعم نمو الشركات ومختلف القطاعات التجارية. تحولنا من مصنع محلي طموح إلى أحد الأسماء الموثوقة في قطاع الإنتاج والتغليف الصناعي، مستندين إلى الابتكار والالتزام الكامل بالجودة.</p><h3>رؤيتنا</h3><p>أن نصبح المصنع الرائد والأكثر كفاءة في مجال التعبئة والتغليف على مستوى المنطقة، من خلال تمكين العلامات التجارية من تقديم منتجاتها بأفضل صورة آمنة وجذابة للأسواق العالمية.</p>" },
        { type: "text", title: "لماذا تختار «روض الأصيل»؟", content: "<table><thead><tr><th>الميزة</th><th>التفاصيل</th></tr></thead><tbody><tr><td><strong>جودة إنتاجية مضمونة</strong></td><td>نطبق أدق المعايير الصناعية لضمان سلامة وجودة التعبئة لكل منتج.</td></tr><tr><td><strong>حلول متكاملة ومخصصة</strong></td><td>نقدم خدمات مخصصة تلبي تطلعات واحتياجات مختلف القطاعات التجارية.</td></tr><tr><td><strong>التزام تام بالمواعيد</strong></td><td>نضمن تنفيذ الطلبات والإنتاج وفق الجداول الزمنية المحددة وبأعلى كفاءة.</td></tr><tr><td><strong>أسعار تنافسية</strong></td><td>نوفر أفضل عروض الأسعار في السوق الصناعي بما يتناسب مع أحجام الإنتاج المختلفة.</td></tr><tr><td><strong>دعم فني متواصل</strong></td><td>فريق خدمة العملاء متاح لمتابعة خطوط الإنتاج والرد على استفساراتكم بمرونة عالية.</td></tr></tbody></table>" }
      ]
    }
  },
  "anti-fraud": {
    en: {
      title: "Anti-Fraud Policy",
      slug: "anti-fraud",
      sections: [
        { type: "text", title: "Our Commitment to Security", content: "<p>Rawd Al-Aseel is committed to protecting our customers and our business from fraudulent activities. We employ advanced security measures and verification procedures to detect and prevent fraud.</p><h3>Fraud Prevention Measures</h3><ul><li><strong>Order Verification:</strong> We may verify high-value or suspicious orders via phone call before processing</li><li><strong>Address Verification:</strong> Orders are shipped only to verified addresses matching the billing or registered address</li><li><strong>Payment Security:</strong> All payment transactions are encrypted and processed through secure, PCI-compliant gateways</li><li><strong>Account Monitoring:</strong> Suspicious account activity is monitored and may result in account suspension</li></ul>" },
        { type: "text", title: "Reporting Fraud", content: "<p>If you suspect fraudulent activity on your account or unauthorized use of your payment method, please contact us immediately by phone at <strong>+966 55 000 0000</strong> or email <strong>security@raowdalaseel.com</strong>. We take all reports seriously and will investigate promptly.</p><h3>Consequences of Fraud</h3><p>Fraudulent activities, including but not limited to using stolen payment methods, providing false information, or attempting to deceive our systems, will result in:</p><ul><li>Immediate cancellation of orders</li><li>Permanent account suspension</li><li>Reporting to relevant authorities</li><li>Legal action where applicable</li></ul>" }
      ]
    },
    ar: {
      title: "سياسة مكافحة الاحتيال",
      slug: "anti-fraud",
      sections: [
        { type: "text", title: "التزامنا بالأمان", content: "<p>روض الأصيل ملتزمة بحماية عملائنا وأعمالنا من الأنشطة الاحتيالية. نستخدم إجراءات أمنية متقدمة للكشف عن الاحتيال ومنعه.</p><h3>إجراءات منع الاحتيال</h3><ul><li><strong>التحقق من الطلب:</strong> قد نتحقق من الطلبات عالية القيمة عبر الهاتف قبل تنفيذها</li><li><strong>التحقق من العنوان:</strong> يتم الشحن فقط إلى العناوين الموثقة والمطابقة لبيانات حامل البطاقة</li><li><strong>أمان الدفع:</strong> جميع معاملات الدفع مشفرة وتتم عبر بوابات دفع آمنة</li><li><strong>مراقبة الحسابات:</strong> يتم مراقبة النشاط المشبوه وقد يؤدي إلى تعليق الحساب</li></ul>" },
        { type: "text", title: "الإبلاغ عن الاحتيال", content: "<p>إذا اشتبهت في وجود نشاط احتيالي على حسابك أو استخدام غير مصرح به لوسيلة الدفع الخاصة بك، يرجى الاتصال بنا فوراً على <strong>+966 55 000 0000</strong> أو عبر البريد الإلكتروني <strong>security@raowdalaseel.com</strong>. نأخذ جميع البلاغات على محمل الجد ونحقق فيها بجدية.</p><h3>عواقب الاحتيال</h3><p>الأنشطة الاحتيالية، بما في ذلك استخدام وسائل دفع مسروقة أو تقديم معلومات مضللة أو محاولة خداع أنظمتنا، تؤدي إلى:</p><ul><li>إلغاء الطلبات فوراً</li><li>تعليق الحساب نهائياً</li><li>الإبلاغ إلى الجهات الرسمية المختصة</li><li>اتخاذ الإجراءات القانونية عند الاقتضاء</li></ul>" }
      ]
    }
  },
  "cash-on-delivery": {
    en: {
      title: "Cash on Delivery",
      slug: "cash-on-delivery",
      sections: [
        { type: "text", title: "What is Cash on Delivery?", content: "<p>Cash on Delivery (COD) is a convenient payment method that allows you to pay for your order in cash when it arrives at your doorstep. No prepayment is required, giving you peace of mind and complete control over your purchase.</p><h3>How It Works</h3><ol><li>Select Cash on Delivery as your payment method at checkout</li><li>Place your order as usual</li><li>Receive your order at your doorstep</li><li>Pay the total amount in cash to the delivery agent</li></ol>" },
        { type: "text", title: "Important Information", content: "<ul><li><strong>Availability:</strong> COD is available in most cities and regions across the Kingdom of Saudi Arabia. Some remote areas may not be eligible.</li><li><strong>Fees:</strong> A nominal handling fee of SAR 10–20 may apply depending on the order value and location.</li><li><strong>Maximum Order Value:</strong> Orders up to SAR 10,000 are eligible for COD payment.</li><li><strong>Order Confirmation:</strong> You may receive a verification call to confirm your order before dispatch.</li></ul>" }
      ]
    },
    ar: {
      title: "الدفع عند الاستلام",
      slug: "cash-on-delivery",
      sections: [
        { type: "text", title: "ما هو الدفع عند الاستلام؟", content: "<p>الدفع عند الاستلام هو طريقة دفع مريحة تسمح لك بدفع قيمة طلبك نقداً عند وصوله إلى باب منزلك. لا حاجة للدفع المسبق، مما يمنحك راحة البال والتحكم الكامل في مشترياتك.</p><h3>كيف يعمل</h3><ol><li>اختر الدفع عند الاستلام كطريقة دفع أثناء إتمام الشراء</li><li>قم بتقديم طلبك كالمعتاد</li><li>استلم طلبك عند باب منزلك</li><li>ادفع المبلغ الإجمالي نقداً لمندوب التوصيل</li></ol>" },
        { type: "text", title: "معلومات مهمة", content: "<ul><li><strong>التوفر:</strong> متوفر في معظم مدن ومناطق المملكة العربية السعودية، وقد لا يكون متاحاً في بعض المناطق النائية</li><li><strong>الرسوم:</strong> رسوم خدمة رمزية من 10 إلى 20 ريالاً حسب قيمة الطلب والموقع</li><li><strong>الحد الأقصى للطلب:</strong> طلبات حتى 10,000 ريال سعودي</li><li><strong>تأكيد الطلب:</strong> قد تتلقى اتصالاً للتحقق من طلبك قبل الشحن</li></ul>" }
      ]
    }
  },
  "community": {
    en: {
      title: "Community and Society",
      slug: "community",
      sections: [
        { type: "text", title: "Our Community Commitment", content: "<p>At Rawd Al-Aseel, we believe in the power of community. We are committed to making a positive impact on the communities we serve through various social initiatives and sustainable industrial practices.</p><h3>Our Initiatives</h3><ul><li><strong>Supporting Local Businesses:</strong> We partner with local suppliers and small businesses in the Kingdom, providing them with reliable packaging and production solutions</li><li><strong>Sustainability:</strong> We work to reduce our environmental footprint through recyclable and eco-friendly packaging materials, waste-reduction programs, and responsible sourcing</li><li><strong>Food & Industry Awareness:</strong> We support awareness campaigns on food safety, proper storage, and industrial best practices to educate and empower our community</li><li><strong>Charitable Partnerships:</strong> We collaborate with charitable organizations to support those in need, particularly during Ramadan and other special occasions</li></ul>" },
        { type: "text", title: "Join Us", content: "<p>We invite our customers and partners to join us in our community initiatives. Together, we can make a difference. Follow us on social media to stay updated on our latest community projects and events.</p>" }
      ]
    },
    ar: {
      title: "المسؤولية المجتمعية",
      slug: "community",
      sections: [
        { type: "text", title: "التزامنا المجتمعي", content: "<p>في روض الأصيل، نؤمن بقوة المجتمع. نحن ملتزمون بإحداث تأثير إيجابي في المجتمعات التي نخدمها من خلال مختلف المبادرات الاجتماعية والممارسات الصناعية المستدامة.</p><h3>مبادراتنا</h3><ul><li><strong>دعم المنشآت المحلية:</strong> نتعاون مع الموردين والشركات الصغيرة في المملكة، ونوفر لهم حلول تعبئة وإنتاج موثوقة</li><li><strong>الاستدامة:</strong> نعمل على تقليل بصمتنا البيئية عبر مواد تغليف قابلة للتدوير وصديقة للبيئة، وبرامج تقليل الفاقد، والمصادر المسؤولة</li><li><strong>التوعية الغذائية والصناعية:</strong> ندعم حملات التوعية حول سلامة الغذاء والتخزين الصحيح وأفضل الممارسات الصناعية لتثقيف وتمكين مجتمعنا</li><li><strong>الشراكات الخيرية:</strong> نتعاون مع المنظمات الخيرية لدعم المحتاجين، لا سيما خلال شهر رمضان والمناسبات الأخرى</li></ul>" },
        { type: "text", title: "انضم إلينا", content: "<p>ندعو عملاءنا وشركاءنا للانضمام إلينا في مبادراتنا المجتمعية. معاً، يمكننا إحداث فرق. تابعونا على وسائل التواصل الاجتماعي للاطلاع على أحدث مشاريعنا وفعالياتنا المجتمعية.</p>" }
      ]
    }
  },
  "company": {
    en: {
      title: "Our Company",
      slug: "company",
      sections: [
        { type: "text", title: "About Rawd Al-Aseel", content: "<p>Rawd Al-Aseel is a Saudi packaging and industrial production factory specializing in professional packaging services and integrated production solutions for businesses across diverse commercial sectors, alongside its online retail store.</p><p>Backed by modern production lines and rigorous quality standards, we help brands bring their products to market safely and attractively — from raw materials to finished, shelf-ready packages.</p>" },
        { type: "text", title: "Our Mission", content: "<p>Our mission is to empower businesses with reliable, efficient, and cost-effective packaging and production services that meet the highest industrial standards, enabling our partners to grow with confidence.</p>" },
        { type: "text", title: "Our Values", content: "<ul><li><strong>Quality First:</strong> Every package we produce meets the exacting standards of the industry</li><li><strong>Partnership:</strong> Your goals are our goals — we grow when our partners grow</li><li><strong>Innovation:</strong> We continuously invest in modern production technologies and packaging solutions</li><li><strong>Integrity:</strong> We conduct our business with honesty, transparency, and respect</li></ul>" }
      ]
    },
    ar: {
      title: "شركتنا",
      slug: "company",
      sections: [
        { type: "text", title: "عن روض الأصيل", content: "<p>روض الأصيل مصنع سعودي متخصص في التعبئة والتغليف والإنتاج الصناعي، يقدم خدمات تغليف احترافية وحلول إنتاج متكاملة للشركات من مختلف القطاعات التجارية، إلى جانب متجره الإلكتروني.</p><p>بدعم من خطوط إنتاج حديثة ومعايير جودة صارمة، نساعد العلامات التجارية على طرح منتجاتها في الأسواق بأمان وجاذبية — من المواد الخام إلى العبوة الجاهزة للترويج.</p>" },
        { type: "text", title: "مهمتنا", content: "<p>مهمتنا هي تمكين المنشآت من خدمات تعبئة وإنتاج موثوقة، فعّالة، وبكلفة تنافسية، ترقى إلى أعلى المعايير الصناعية، بما يمكّن شركاءنا من النمو بثقة.</p>" },
        { type: "text", title: "قيمنا", content: "<ul><li><strong>الجودة أولاً:</strong> كل ما ننتجه يلبي أدق معايير الصناعة</li><li><strong>الشراكة:</strong> أهدافكم هي أهدافنا — ننمو حين ينمو شركاؤنا</li><li><strong>الابتكار:</strong> نستثمر باستمرار في تقنيات الإنتاج الحديثة وحلول التغليف</li><li><strong>النزاهة:</strong> نتعامل بأمانة وشفافية واحترام</li></ul>" }
      ]
    }
  },
  "contact": {
    en: {
      title: "Contact Us",
      slug: "contact",
      sections: [
        { type: "text", title: "We Are Here to Help", content: "<p>Do you have a question about our packaging lines, bulk orders, or want to request a price quotation? We would love to hear from you. Our dedicated customer service and B2B corporate teams at Rawd Al-Aseel Factory are ready to assist you with all your manufacturing inquiries.</p>" },
        { type: "text", title: "Customer Service & Corporate Support", content: "<ul><li><strong>Corporate Email:</strong> info@raowdalaseel.com</li><li><strong>Official Website:</strong> raowdalaseel.com</li><li><strong>Social Media Support:</strong> Connect via our official Rawd Al-Aseel Facebook Page.</li></ul>" },
        { type: "text", title: "Official Operating Hours", content: "<table><thead><tr><th>Department</th><th>Days</th><th>Hours</th></tr></thead><tbody><tr><td><strong>Customer Support & Inquiry Intake</strong></td><td>Sunday to Thursday</td><td>9:00 AM – 5:00 PM</td></tr><tr><td><strong>Production & Factory Pickup</strong></td><td>Sunday to Thursday</td><td>8:00 AM – 4:00 PM</td></tr><tr><td><strong>Weekly Holiday</strong></td><td>Friday & Saturday</td><td>Closed</td></tr></tbody></table>" }
      ]
    },
    ar: {
      title: "اتصل بنا",
      slug: "contact",
      sections: [
        { type: "text", title: "نحن هنا لمساعدتكم", content: "<p>لديك استفسار حول خطوط إنتاجنا، طلبات التعبئة، أو ترغب في الحصول على عرض سعر؟ يسعدنا دائماً تواصلكم معنا. فريق خدمة العملاء والدعم التجاري في مصنع روض الأصيل مستعد لتقديم كافة الحلول لتلبية احتياجات أعمالكم.</p>" },
        { type: "text", title: "خدمة العملاء والدعم التجاري", content: "<ul><li><strong>البريد الإلكتروني للشركات:</strong> info@raowdalaseel.com</li><li><strong>الموقع الإلكتروني الرسمي:</strong> raowdalaseel.com</li><li><strong>للتواصل والمتابعة:</strong> عبر صفحتنا الرسمية «روض الأصيل» على فيسبوك.</li></ul>" },
        { type: "text", title: "ساعات العمل الرسمية", content: "<table><thead><tr><th>القسم</th><th>الأيام</th><th>المواعيد</th></tr></thead><tbody><tr><td><strong>الدعم الفني واستقبل الطلبات</strong></td><td>من الأحد إلى الخميس</td><td>من الساعة 9:00 صباحاً حتى 5:00 مساءً</td></tr><tr><td><strong>الإنتاج واستلام الشحنات</strong></td><td>من الأحد إلى الخميس</td><td>من الساعة 8:00 صباحاً حتى 4:00 مساءً</td></tr><tr><td><strong>العطلة الأسبوعية</strong></td><td>الجمعة والسبت</td><td>مغلق</td></tr></tbody></table>" }
      ]
    }
  },
  "disclosure": {
    en: {
      title: "Legal Disclosure",
      slug: "disclosure",
      sections: [
        { type: "text", title: "Company Information", content: "<p>In compliance with the regulations of the Kingdom of Saudi Arabia, the following information is provided for legal and regulatory purposes.</p><h3>Company Details</h3><ul><li><strong>Legal Name:</strong> Rawd Al-Aseel Packaging Factory</li><li><strong>Commercial Registration:</strong> 0000000000</li><li><strong>VAT Number:</strong> 000000000000003</li><li><strong>Registered Address:</strong> Second Industrial City, Riyadh, Kingdom of Saudi Arabia</li></ul><h3>Contact Information</h3><ul><li><strong>Phone:</strong> +966 55 000 0000</li><li><strong>Email:</strong> legal@raowdalaseel.com</li></ul><h3>Regulatory Compliance</h3><p>Rawd Al-Aseel operates in full compliance with Saudi consumer protection laws, e-commerce regulations, and the Personal Data Protection Law (PDPL). Packaged food products listed on our store meet the quality and safety standards set by the Saudi Food and Drug Authority (SFDA), and our production lines follow approved industrial standards.</p>" }
      ]
    },
    ar: {
      title: "الإفصاح القانوني",
      slug: "disclosure",
      sections: [
        { type: "text", title: "معلومات الشركة", content: "<p>امتثالاً لأنظمة المملكة العربية السعودية، يتم توفير المعلومات التالية للأغراض القانونية والتنظيمية.</p><h3>بيانات الشركة</h3><ul><li><strong>الاسم القانوني:</strong> مصنع روض الأصيل للتعبئة والتغليف</li><li><strong>السجل التجاري:</strong> 0000000000</li><li><strong>الرقم الضريبي:</strong> 000000000000003</li><li><strong>العنوان المسجل:</strong> المدينة الصناعية الثانية، الرياض، المملكة العربية السعودية</li></ul><h3>معلومات الاتصال</h3><ul><li><strong>الهاتف:</strong> +966 55 000 0000</li><li><strong>البريد الإلكتروني:</strong> legal@raowdalaseel.com</li></ul><h3>الامتثال التنظيمي</h3><p>يلتزم روض الأصيل التزاماً كاملاً بأنظمة حماية المستهلك السعودية ولوائح التجارة الإلكترونية ونظام حماية البيانات الشخصية. وتخضع منتجات الأغذية المعلبة المعروضة في متجرنا لمعايير الجودة والسلامة التي تقررها الهيئة العامة للغذاء والدواء (SFDA)، وتعمل خطوط الإنتاج لدينا وفق المعايير الصناعية المعتمدة.</p>" }
      ]
    }
  },
  "extended-warranty": {
    en: {
      title: "Extended Warranty Program",
      slug: "extended-warranty",
      sections: [
        { type: "text", title: "Protect Your Purchase", content: "<p>Extend the life of your kitchen appliances and equipment with the Rawd Al-Aseel Extended Warranty Program. For a small additional fee, you can extend the manufacturer's warranty on eligible items, giving you extra peace of mind.</p><h3>Coverage Details</h3><ul><li><strong>Duration:</strong> Choose between 1 or 2 additional years of coverage</li><li><strong>What's Covered:</strong> Manufacturing defects, and mechanical or electrical failures under normal use</li><li><strong>What's Not Covered:</strong> Accidental damage, misuse, unauthorized repairs, or loss/theft</li></ul>" },
        { type: "text", title: "How to Purchase", content: "<p>The extended warranty can be added during checkout for eligible products. Simply select the warranty option when adding items to your cart. You will receive your warranty certificate by email within 48 hours of purchase.</p><p>To make a claim, contact our customer service team by phone at <strong>+966 55 000 0000</strong> or email us at <strong>support@raowdalaseel.com</strong> with your order number and warranty certificate.</p>" }
      ]
    },
    ar: {
      title: "برنامج الضمان الممتد",
      slug: "extended-warranty",
      sections: [
        { type: "text", title: "احمِ مشترياتك", content: "<p>أطِل عمر أجهزة المطبخ والمعدات المفضلة لديك مع برنامج الضمان الممتد من روض الأصيل. مقابل رسوم إضافية بسيطة، يمكنك تمديد ضمان الشركة المصنعة على المنتجات المؤهلة وضمان راحة بالك.</p><h3>تفاصيل التغطية</h3><ul><li><strong>المدة:</strong> اختر سنة أو سنتين إضافيتين من التغطية</li><li><strong>المشمول:</strong> عيوب التصنيع والأعطال الميكانيكية أو الكهربائية الناشئة عن الاستخدام الطبيعي</li><li><strong>غير المشمول:</strong> الضرر العرضي، سوء الاستخدام، الإصلاحات غير المصرح بها، أو الضياع</li></ul>" },
        { type: "text", title: "كيفية الشراء", content: "<p>يمكن إضافة الضمان الممتد أثناء إتمام الشراء للمنتجات المؤهلة. اختر خيار الضمان عند إضافة المنتج إلى السلة، وستستلم شهادة الضمان عبر البريد الإلكتروني خلال 48 ساعة من الشراء.</p><p>لتقديم مطالبة، اتصل بفريق خدمة العملاء على <strong>+966 55 000 0000</strong> أو راسلنا على <strong>support@raowdalaseel.com</strong> مع رقم طلبك وشهادة الضمان.</p>" }
      ]
    }
  },
  "faq": {
    en: {
      title: "Frequently Asked Questions",
      slug: "faq",
      sections: [
        { type: "text", title: "Orders & Payment", content: "<h3>How do I place an order?</h3><p>Simply browse our store, add desired items to your cart, and proceed to checkout. Follow the steps to enter your shipping details and choose a payment method.</p><h3>Can I modify or cancel my order?</h3><p>You can cancel your order within one hour of placing it. Modifications may be possible if the order has not yet been processed. Contact our customer service team for assistance.</p><h3>What payment methods do you accept?</h3><p>We accept Mada, credit/debit cards (Visa, MasterCard, American Express), Apple Pay, Cash on Delivery, and bank transfers.</p><h3>Is my payment information secure?</h3><p>Yes. All transactions are encrypted and processed through secure, PCI DSS compliant payment gateways. Your financial data is never stored on our servers.</p>" },
        { type: "text", title: "Shipping & Delivery", content: "<h3>How long does delivery take?</h3><p>Standard delivery takes 3–7 business days. Express delivery takes 1–2 business days. Same-day delivery is available in select areas.</p><h3>Do you ship internationally?</h3><p>Currently, we deliver within the Kingdom of Saudi Arabia. We hope to expand internationally in the future.</p><h3>How can I track my order?</h3><p>Once your order is dispatched, you will receive a tracking number via email and SMS. You can also track your order from the «My Orders» section in your account.</p>" },
        { type: "text", title: "Returns & Refunds", content: "<h3>Can I return a product?</h3><p>Yes. You can return most sealed, unused products within 14 days of delivery. Product seals and packaging must be intact. Please refer to our Returns Policy for detailed information on eligibility and process.</p><h3>How long do refunds take?</h3><p>Refunds are processed within 5–10 business days after we receive the returned item. The refund will be issued to your original payment method.</p>" }
      ]
    },
    ar: {
      title: "الأسئلة الشائعة",
      slug: "faq",
      sections: [
        { type: "text", title: "الطلبات والدفع", content: "<h3>كيف أقدم طلباً؟</h3><p>تصفح متجرنا، أضف المنتجات المطلوبة إلى سلة التسوق، وتابع إلى إتمام الشراء. أدخل بيانات الشحن واختر طريقة الدفع المناسبة لك.</p><h3>هل يمكنني تعديل أو إلغاء طلبي؟</h3><p>يمكنك إلغاء طلبك خلال ساعة من تقديمه. قد يكون التعديل ممكناً إذا لم تتم معالجة الطلب بعد. تواصل مع فريق خدمة العملاء للمساعدة.</p><h3>ما طرق الدفع المتاحة؟</h3><p>نقبل بطاقات مدى، بطاقات الائتمان/الخصم (فيزا، ماستركارد، أمريكان إكسبريس)، Apple Pay، الدفع عند الاستلام، والتحويل البنكي.</p><h3>هل معلومات الدفع آمنة؟</h3><p>نعم. جميع المعاملات مشفرة وآمنة وتتم عبر بوابات دفع متوافقة مع معايير PCI DSS، ولا يتم تخزين بياناتك المالية على خوادمنا.</p>" },
        { type: "text", title: "الشحن والتوصيل", content: "<h3>كم تستغرق مدة التوصيل؟</h3><p>التوصيل القياسي: 3–7 أيام عمل. التوصيل السريع: 1–2 يوم عمل. التوصيل في نفس اليوم متاح في مناطق محددة.</p><h3>هل تشحنون دولياً؟</h3><p>حالياً، نُسلم داخل المملكة العربية السعودية، ونستهدف التوسع دولياً مستقبلاً.</p><h3>كيف أتتبع طلبي؟</h3><p>ستتلقى رقم تتبع عبر البريد الإلكتروني والرسائل النصية بمجرد شحن طلبك، ويمكنك أيضاً متابعة طلبك من قسم «طلباتي» في حسابك.</p>" },
        { type: "text", title: "الإرجاع والاسترداد", content: "<h3>هل يمكنني إرجاع منتج؟</h3><p>نعم. يمكنك إرجاع معظم المنتجات المغلقة وغير المستخدمة خلال 14 يوماً من التوصيل، بشرط أن تكون الأختان والتغليف سليمة. راجع سياسة الإرجاع لمزيد من التفاصيل.</p><h3>كم تستغرق المبالغ المستردة؟</h3><p>تتم معالجة المبالغ المستردة خلال 5–10 أيام عمل بعد استلام المنتج المرتجع، ويعود المبلغ إلى وسيلة الدفع الأصلية.</p>" }
      ]
    }
  },
  "loyalty": {
    en: {
      title: "Loyalty Program",
      slug: "loyalty",
      sections: [
        { type: "text", title: "Rawd Al-Aseel Rewards Program", content: "<p>Welcome to Rawd Al-Aseel Rewards — our loyalty program designed to thank you for your continued trust and support. Earn points with every purchase and redeem them for discounts and exclusive perks.</p><h3>How It Works</h3><ol><li><strong>Sign Up:</strong> Create a free Rawd Al-Aseel account and automatically join the rewards program</li><li><strong>Earn Points:</strong> Earn 1 point for every SAR 10 spent. Bonus points are available on selected products and promotions</li><li><strong>Redeem:</strong> Exchange 100 points for a SAR 10 discount on your next purchase</li></ol>" },
        { type: "text", title: "Membership Tiers", content: "<h3>Silver (0–500 points)</h3><ul><li>1 point per SAR 10 spent</li><li>Birthday bonus: 50 points</li></ul><h3>Gold (501–1,500 points)</h3><ul><li>1.5 points per SAR 10 spent</li><li>Birthday bonus: 100 points</li><li>Free standard shipping on all orders</li></ul><h3>Platinum (1,500+ points)</h3><ul><li>2 points per SAR 10 spent</li><li>Birthday bonus: 200 points</li><li>Free express shipping on all orders</li><li>Early access to sales and new product launches</li></ul>" }
      ]
    },
    ar: {
      title: "برنامج المكافآت",
      slug: "loyalty",
      sections: [
        { type: "text", title: "برنامج مكافآت روض الأصيل", content: "<p>مرحباً بك في مكافآت روض الأصيل — برنامج الولاء الذي صنعه شكرك على ثقتك ودعمك المستمر. اربح نقاطاً مع كل عملية شراء واستبدلها بخصومات ومزايا حصرية.</p><h3>كيف يعمل</h3><ol><li><strong>التسجيل:</strong> أنشئ حساباً مجانياً في روض الأصيل وانضم للبرنامج تلقائياً</li><li><strong>اكسب نقاط:</strong> نقطة واحدة عن كل 10 ريالات من الشراء، مع نقاط إضافية على منتجات وعروض مختارة</li><li><strong>الاستبدال:</strong> استبدل 100 نقطة بخصم 10 ريالات على مشترياتك القادمة</li></ol>" },
        { type: "text", title: "مستويات العضوية", content: "<h3>فضي (0–500 نقطة)</h3><ul><li>نقطة لكل 10 ريالات</li><li>مكافأة عيد الميلاد: 50 نقطة</li></ul><h3>ذهبي (501–1,500 نقطة)</h3><ul><li>1.5 نقطة لكل 10 ريالات</li><li>مكافأة عيد الميلاد: 100 نقطة</li><li>شحن قياسي مجاني على جميع الطلبات</li></ul><h3>بلاتيني (1,500+ نقطة)</h3><ul><li>نقطتان لكل 10 ريالات</li><li>مكافأة عيد الميلاد: 200 نقطة</li><li>شحن سريع مجاني على جميع الطلبات</li><li>وصول مبكر إلى التخفيضات والمنتجات الجديدة</li></ul>" }
      ]
    }
  },
  "newsletter": {
    en: {
      title: "Newsletter",
      slug: "newsletter",
      sections: [
        { type: "text", title: "Subscribe to Our Newsletter", content: "<p>Stay up to date with our latest products, exclusive offers, and practical tips on storage, packaging, and industrial solutions. Subscribe to the Rawd Al-Aseel newsletter and never miss a great deal!</p><h3>Benefits of Subscribing</h3><ul><li><strong>Exclusive Discounts:</strong> Receive subscriber-only promo codes and special offers</li><li><strong>Early Access:</strong> Be the first to know about new product launches and flash sales</li><li><strong>Practical Tips:</strong> Get expert advice on proper storage of spices and pulses, and on sustainable packaging solutions</li><li><strong>Personalized Recommendations:</strong> Receive product suggestions tailored to your preferences and purchase history</li></ul><p>You can unsubscribe at any time. We respect your privacy and will never share your email with third parties.</p>" }
      ]
    },
    ar: {
      title: "النشرة البريدية",
      slug: "newsletter",
      sections: [
        { type: "text", title: "اشترك في نشرتنا البريدية", content: "<p>ابق على اطلاع بأحدث منتجاتنا والعروض الحصرية والنصائح العملية حول التخزين والتغليف وحلولنا الصناعية. اشترك في النشرة البريدية لروض الأصيل ولا تفوت العروض الرائعة!</p><h3>مزايا الاشتراك</h3><ul><li><strong>خصومات حصرية:</strong> احصل على رموز ترويجية وعروض خاصة للمشتركين فقط</li><li><strong>وصول مبكر:</strong> كن أول من يعرف عن إطلاق المنتجات الجديدة والتخفيضات السريعة</li><li><strong>نصائح عملية:</strong> نصائح خبراء حول التخزين الصحيح للتوابل والبقوليات، وحول حلول التغليف المستدامة</li><li><strong>توصيات مخصصة:</strong> اقتراحات منتجات مصممة حسب تفضيلاتك وسجل شرائك</li></ul><p>يمكنك إلغاء الاشتراك في أي وقت. نحن نحترم خصوصيتك ولن نشارك بريدك الإلكتروني مع أطراف ثالثة.</p>" }
      ]
    }
  },
  "payment": {
    en: {
      title: "Secured Online Payment",
      slug: "payment",
      sections: [
        { type: "text", title: "Payment Methods", content: "<p>We offer a wide range of secure payment methods for your convenience. All transactions are processed through encrypted connections and your financial information is never stored on our servers.</p><ul><li><strong>Mada:</strong> Fast and secure payments with your Saudi Mada card</li><li><strong>Credit and Debit Cards:</strong> We accept Visa, MasterCard, and American Express. Your card details are encrypted using industry-standard SSL technology.</li><li><strong>Apple Pay:</strong> One-tap checkout with your Apple devices</li><li><strong>Cash on Delivery:</strong> Pay in cash when your order arrives. Available for most areas with a nominal fee.</li><li><strong>Bank Transfer:</strong> Direct transfer to our bank account. Orders are processed once payment is confirmed.</li></ul>" },
        { type: "text", title: "Security", content: "<p>At Rawd Al-Aseel, we take payment security seriously. Our payment gateways are PCI DSS compliant, ensuring that your payment data is handled according to the highest security standards. We employ advanced encryption, fraud monitoring, and secure tokenization to protect every transaction.</p><p>Your trust is important to us. If you notice any unauthorized transactions, please contact us immediately at <strong>+966 55 000 0000</strong>.</p>" }
      ]
    },
    ar: {
      title: "الدفع الآمن عبر الإنترنت",
      slug: "payment",
      sections: [
        { type: "text", title: "طرق الدفع", content: "<p>نقدم مجموعة واسعة من طرق الدفع الآمنة لراحتك. جميع المعاملات مشفرة ومؤمنة، ولا يتم تخزين بياناتك المالية على خوادمنا.</p><ul><li><strong>بطاقة مدى:</strong> دفع سريع وآمن باستخدام بطاقة مدى السعودية</li><li><strong>بطاقات الائتمان والخصم:</strong> فيزا، ماستركارد، وأمريكان إكسبريس مع تشفير SSL</li><li><strong>Apple Pay:</strong> إتمام الشراء بلمسة واحدة من أجهزتك</li><li><strong>الدفع عند الاستلام:</strong> ادفع نقداً عند وصول طلبك (متاح في معظم المناطق برسوم رمزية)</li><li><strong>التحويل البنكي:</strong> تحويل مباشر إلى حسابنا البنكي وتُعالج الطلبات بعد تأكيد الدفع</li></ul>" },
        { type: "text", title: "الأمان", content: "<p>في روض الأصيل، نأخذ أمان الدفع على محمل الجد. بوابات الدفع لدينا متوافقة مع PCI DSS، ونستخدم تقنيات التشفير المتقدمة ومراقبة الاحتيال وترميز البيانات الآمن لحماية كل عملية شراء.</p><p>ثقتك مهمة لنا. إذا لاحظت أي معاملات غير مصرح بها، تواصل معنا فوراً على <strong>+966 55 000 0000</strong>.</p>" }
      ]
    }
  },
  "privacy": {
    en: {
      title: "Privacy Policy",
      slug: "privacy",
      sections: [
        { type: "text", title: "Introduction", content: "<p>At Rawd Al-Aseel, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you visit our website or make a purchase, in accordance with the Saudi Personal Data Protection Law (PDPL). Please read this policy carefully.</p><h3>Information We Collect</h3><p>We may collect the following types of information:</p><ul><li><strong>Personal Information:</strong> Name, email address, phone number, shipping/billing address, and payment information when you place an order</li><li><strong>Account Information:</strong> Username, password, order history, and preferences when you create an account</li><li><strong>Usage Data:</strong> IP address, browser type, device information, pages visited, and browsing behavior</li><li><strong>Cookies:</strong> We use cookies to enhance your browsing experience and analyze website traffic</li></ul><h3>How We Use Your Information</h3><ul><li>Process and fulfill your orders</li><li>Communicate with you about your orders and account</li><li>Send promotional offers and newsletters (with your consent)</li><li>Improve our website and services</li><li>Prevent fraud and ensure security</li><li>Comply with legal obligations</li></ul><h3>Information Sharing</h3><p>We do not sell your personal information to third parties. We may share your information with trusted service providers (such as payment processors and shipping companies) solely for the purpose of fulfilling your order. These partners are contractually obligated to protect your data.</p><h3>Data Security</h3><p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Our security practices include SSL encryption, secure servers, and regular security audits.</p><h3>Your Rights</h3><p>You have the right to access, correct, or delete your personal information at any time. You can manage your preferences through your account settings, or contact our support team at <strong>info@raowdalaseel.com</strong>.</p>" }
      ]
    },
    ar: {
      title: "سياسة الخصوصية",
      slug: "privacy",
      sections: [
        { type: "text", title: "مقدمة", content: "<p>في روض الأصيل، نأخذ خصوصيتك على محمل الجد. تشرح سياسة الخصوصية هذه كيف نجمع ونستخدم ونحمي معلوماتك الشخصية عند زيارة موقعنا أو إجراء عملية شراء، وذلك وفقاً لنظام حماية البيانات الشخصية السعودي (PDPL).</p><h3>المعلومات التي نجمعها</h3><ul><li><strong>المعلومات الشخصية:</strong> الاسم، البريد الإلكتروني، رقم الهاتف، عنوان الشحن، ومعلومات الدفع عند تقديم الطلب</li><li><strong>معلومات الحساب:</strong> اسم المستخدم، كلمة المرور، سجل الطلبات، والتفضيلات عند إنشاء الحساب</li><li><strong>بيانات الاستخدام:</strong> عنوان IP، نوع المتصفح، معلومات الجهاز، الصفحات المزارة، وسلوك التصفح</li><li><strong>ملفات تعريف الارتباط:</strong> نستخدمها لتحسين تجربة التصفح وتحليل زيارات الموقع</li></ul><h3>كيف نستخدم معلوماتك</h3><ul><li>معالجة وتنفيذ طلباتك</li><li>التواصل معك بخصوص الطلبات والحساب</li><li>إرسال العروض الترويجية والنشرة البريدية (بموافقتك)</li><li>تحسين موقعنا وخدماتنا</li><li>منع الاحتيال وضمان الأمان</li><li>الالتزام بالإلزامات القانونية</li></ul><h3>مشاركة المعلومات</h3><p>لا نبيع بياناتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك مع مزودي خدمات موثوقين (مثل معالجات الدفع وشركات التوصيل) فقط لغرض تنفيذ طلبك، ويلتزم هؤلاء الشركاء تعاقدياً بحماية بياناتك.</p><h3>أمان البيانات</h3><p>نطبق تدابير تقنية وتنظيمية مناسبة لحماية معلوماتك الشخصية من الوصول أو التعديل أو الإفصاح غير المصرح به، بما في ذلك تشفير SSL وخوادم آمنة ودورات تدقيق أمنية دورية.</p><h3>حقوقك</h3><p>من حقك الوصول إلى معلوماتك الشخصية وتصحيحها أو حذفها في أي وقت. يمكنك إدارة تفضيلاتك من إعدادات حسابك أو التواصل مع فريق الدعم على <strong>info@raowdalaseel.com</strong>.</p>" }
      ]
    }
  },
  "returns": {
    en: {
      title: "Returns and Exchanges",
      slug: "returns",
      sections: [
        { type: "text", title: "Return Policy", content: "<p>Customer satisfaction is our top priority. You may return most items within 14 days of delivery for a full refund or exchange.</p><h3>Eligibility</h3><ul><li>Items must be unused and in their original condition with undamaged packaging and seals intact</li><li>Return requests must be initiated within 14 calendar days of delivery</li><li>A valid order number is required</li><li>Opened or unsealed food products are not eligible for return for health and safety reasons</li><li>Bulk and wholesale (production) orders are subject to the terms agreed in the sales contract</li></ul><h3>Process</h3><ol><li>Contact customer service by phone at <strong>+966 55 000 0000</strong> or via WhatsApp</li><li>Receive a return authorization number and shipping instructions</li><li>Pack the item securely and ship it as instructed</li><li>Refund processed within 5–7 business days after inspection</li></ol><h3>Refunds</h3><p>Refunds are credited to your original payment method. Original shipping charges are non-refundable. Return shipping is free for defective items.</p>" }
      ]
    },
    ar: {
      title: "الإرجاع والاستبدال",
      slug: "returns",
      sections: [
        { type: "text", title: "سياسة الإرجاع", content: "<p>رضا العملاء هو أولويتنا القصوى. يمكنك إرجاع معظم المنتجات خلال 14 يوماً من التوصيل مقابل استرداد كامل أو استبدال.</p><h3>شروط الإرجاع</h3><ul><li>يجب أن تكون المنتجات غير مستخدمة وبحالتها الأصلية مع سلامة التغليف والأختام</li><li>يجب تقديم طلب الإرجاع خلال 14 يوماً من الاستلام</li><li>رقم طلب ساري ومطلوب</li><li>المنتجات الغذائية المفتوحة أو التي تم فتح ختمها أو استخدامها غير قابلة للإرجاع لأسباب صحية وتحفظاً لسلامة الغذاء</li><li>تخضع طلبات الجملة والإنتاج للشروط المتفق عليها في عقد البيع</li></ul><h3>الإجراءات</h3><ol><li>تواصل مع خدمة العملاء على <strong>+966 55 000 0000</strong> أو عبر واتساب</li><li>استلم رقم تصريح الإرجاع وتعليمات الشحن</li><li>عبّئ المنتج بأمان وقم بشحنه وفق التعليمات</li><li>يتم الاسترداد خلال 5–7 أيام عمل بعد الفحص</li></ul><h3>المستردات</h3><p>تُعاد المبالغ إلى وسيلة الدفع الأصلية. رسوم الشحن الأصلية غير قابلة للاسترداد، والشحن الإرجاعي مجاني للمنتجات المعيبة.</p>" }
      ]
    }
  },
  "service-warranty": {
    en: {
      title: "Service and Warranty",
      slug: "service-warranty",
      sections: [
        { type: "text", title: "Quality Guarantee & Warranty Coverage", content: "<p>All products sold on the Rawd Al-Aseel store are covered by a comprehensive guarantee against defects in materials and manufacturing, following the quality and safety standards applied in our production lines. Coverage varies depending on the product category.</p><ul><li><strong>Kitchen appliances and tools:</strong> Covered by a 12-month warranty from the date of purchase</li><li><strong>Packaged food products (spices and pulses):</strong> Guaranteed authentic and sealed. Claims for manufacturing or packaging defects accepted within 7 days of delivery (unopened)</li><li><strong>Household goods:</strong> Covered against manufacturing defects for 6 months</li></ul>" },
        { type: "text", title: "How to Claim", content: "<p>To initiate a claim, please contact our customer service team by phone at <strong>+966 55 000 0000</strong> or via WhatsApp with your order number. Provide a detailed description of the issue and supporting evidence. Our team will evaluate your claim and, if needed, provide instructions for returning the product. Once the item is received and inspected, we will process the repair, replacement, or refund.</p>" },
        { type: "text", title: "Exclusions", content: "<p>The warranty does not cover normal wear and tear, damage caused by misuse or negligence, improper storage of consumable products, or items purchased from unauthorized resellers.</p><p>For any questions regarding warranty coverage, please contact our support team.</p>" }
      ]
    },
    ar: {
      title: "الخدمة والضمان",
      slug: "service-warranty",
      sections: [
        { type: "text", title: "ضمان الجودة والتغطية", content: "<p>جميع منتجات متجر روض الأصيل مشمولة بضمان شامل ضد عيوب المواد والصناعة، وفق معايير الجودة والسلامة المطبقة في خطوط الإنتاج لدينا. وتختلف التغطية بحسب فئة المنتج.</p><ul><li><strong>أجهزة وأدوات المطبخ:</strong> ضمان 12 شهراً من تاريخ الشراء</li><li><strong>الأغذية المعلبة (التوابل والبقوليات):</strong> مضمونة الأصالة والختم؛ تُقبل مطالبات عيوب التصنيع أو التعبئة خلال 7 أيام من التوصيل (غير مفتوحة)</li><li><strong>المستلزمات المنزلية:</strong> ضمان ضد عيوب التصنيع لمدة 6 أشهر</li></ul>" },
        { type: "text", title: "كيفية المطالبة", content: "<p>لتقديم مطالبة، اتصل بفريق خدمة العملاء على <strong>+966 55 000 0000</strong> أو عبر واتساب مع رقم طلبك. قدّم وصفاً مفصلاً للمشكلة مع ما يدعمها. سيقيم فريقنا مطالبتك، وعند اللزوم قدّم تعليمات لإرجاع المنتج. بعد استلام المنتج وفحصه، سيتم معالجة الإصلاح أو الاستبدال أو الاسترداد.</p>" },
        { type: "text", title: "استثناءات", content: "<p>لا يغطي الضمان التآكل الناتج عن الاستخدام الاعتيادي أو الأضرار الناتجة عن سوء الاستخدام أو الإهمال، أو التخزين الخاطئ للمنتجات الاستهلاكية، أو المنتجات المشتراة من موزعين غير معتمدين.</p><p>لأي استفسارات حول نطاق الضمان، تواصل مع فريق الدعم.</p>" }
      ]
    }
  },
  "shipping": {
    en: {
      title: "Shipping and Delivery",
      slug: "shipping",
      sections: [
        { type: "text", title: "Delivery Options", content: "<p>We offer fast and reliable delivery across the Kingdom of Saudi Arabia. Our goal is to get your order to you as quickly and safely as possible.</p><h3>Standard Delivery</h3><p><strong>Cost:</strong> Free for orders over SAR 500 | SAR 30 for orders under SAR 500</p><p><strong>Timeline:</strong> 3–7 business days (all regions)</p><h3>Express Delivery</h3><p><strong>Cost:</strong> Flat rate SAR 50 (Riyadh, Jeddah, Dammam)</p><p><strong>Timeline:</strong> 1–2 business days</p><h3>Same Day Delivery</h3><p><strong>Cost:</strong> SAR 80</p><p><strong>Timeline:</strong> Delivered within hours on the same day (available in select areas only)</p>" },
        { type: "text", title: "Order Processing", content: "<p>Orders placed before 2:00 PM on business days are processed and dispatched the same day. Orders placed after 2:00 PM or on weekends/holidays are processed the next business day.</p><p>You will receive a confirmation email with tracking information once your order is dispatched. Delivery times may vary depending on your location and external factors.</p>" }
      ]
    },
    ar: {
      title: "الشحن والتوصيل",
      slug: "shipping",
      sections: [
        { type: "text", title: "خيارات التوصيل", content: "<p>نقدم توصيلاً سريعاً وموثوقاً في جميع مناطق المملكة العربية السعودية، بهدف وصول طلبك إليك بأسرع وأمان ممكن.</p><h3>التوصيل القياسي</h3><p><strong>التكلفة:</strong> مجاني للطلبات فوق 500 ريال | 30 ريالاً للطلبات أقل من 500 ريال</p><p><strong>المدة:</strong> 3–7 أيام عمل (جميع المناطق)</p><h3>التوصيل السريع</h3><p><strong>التكلفة:</strong> 50 ريالاً بسعر ثابت (الرياض، جدة، الدمام)</p><p><strong>المدة:</strong> 1–2 يوم عمل</p><h3>التوصيل في نفس اليوم</h3><p><strong>التكلفة:</strong> 80 ريالاً</p><p><strong>المدة:</strong> يُسلّم خلال ساعات في نفس اليوم (متاح في مناطق محددة فقط)</p>" },
        { type: "text", title: "معالجة الطلبات", content: "<p>يتم تجهيز وشحن الطلبات المقدمة قبل الساعة 2:00 ظهراً في أيام العمل في نفس اليوم، بينما تُعالج الطلبات الواردة بعد الساعة 2:00 أو في العطلات في أول يوم عمل تالٍ.</p><p>ستتلقى رسالة تأكيد بريدية مع معلومات التتبع بمجرد شحن طلبك. قد تختلف أوقات التوصيل حسب موقعك وعوامل خارجية.</p>" }
      ]
    }
  },
  "stores": {
    en: {
      title: "Our Stores",
      slug: "stores",
      sections: [
        { type: "text", title: "Visit Rawd Al-Aseel", content: "<p>You can visit our factory showroom and sales centers to see our packaged products up close — our team is ready to assist you with product information and bulk order inquiries.</p><h3>Head Factory — Riyadh</h3><p><strong>Address:</strong> Second Industrial City, Riyadh, Kingdom of Saudi Arabia<br><strong>Hours:</strong> Sunday to Thursday, 9:00 AM - 5:00 PM</p><h3>Sales Center — Jeddah</h3><p><strong>Address:</strong> Industrial District, Jeddah, Kingdom of Saudi Arabia<br><strong>Hours:</strong> Sunday to Thursday, 10:00 AM - 6:00 PM</p>" }
      ]
    },
    ar: {
      title: "فروعنا",
      slug: "stores",
      sections: [
        { type: "text", title: "زيارة روض الأصيل", content: "<p>يمكنك زيارة معرض المصنع ومراكز بيعنا لمشاهدة منتجاتنا المعلبة عن قرب، وفريقنا جاهز لمساعدتك بمعلومات المنتجات واستفسارات الكميات والطلبات الصناعية.</p><h3>المصنع الرئيسي — الرياض</h3><p><strong>العنوان:</strong> المدينة الصناعية الثانية، الرياض، المملكة العربية السعودية<br><strong>المواعيد:</strong> الأحد إلى الخميس، 9:00 ص - 5:00 م</p><h3>مركز المبيعات — جدة</h3><p><strong>العنوان:</strong> الحي الصناعي، جدة، المملكة العربية السعودية<br><strong>المواعيد:</strong> الأحد إلى الخميس، 10:00 ص - 6:00 م</p>" }
      ]
    }
  },
  "terms": {
    en: {
      title: "Terms and Conditions",
      slug: "terms",
      sections: [
        { type: "text", title: "General Terms", content: "<p>Welcome to Rawd Al-Aseel. By accessing and using this website, you agree to comply with and be bound by the following terms and conditions. Please read them carefully before using our services.</p><h3>Use of the Website</h3><p>By using Rawd Al-Aseel, you confirm that you are at least 18 years old or are using the website under the supervision of a parent or guardian. You are responsible for maintaining the confidentiality of your account and password.</p><h3>Product Information</h3><p>We strive to display accurate product descriptions, images, and pricing. However, we do not guarantee that product descriptions or other content are error-free, complete, or current. We reserve the right to correct any errors and update information at any time.</p><h3>Pricing</h3><p>All prices are listed in Saudi Riyals (SAR) and include applicable taxes (VAT). We reserve the right to modify prices at any time. Promotional codes and discounts are subject to specific terms and may not be combined.</p><h3>Order Acceptance</h3><p>We reserve the right to refuse or cancel any order for reasons including but not limited to product availability, pricing errors, or suspected fraud. If we cancel an order, we will issue a full refund.</p><h3>Consumer Protection & Food Safety</h3><p>All packaged food products offered on the site comply with the standards of the Saudi Food and Drug Authority (SFDA) and applicable consumer protection regulations in the Kingdom of Saudi Arabia.</p>" }
      ]
    },
    ar: {
      title: "الشروط والأحكام",
      slug: "terms",
      sections: [
        { type: "text", title: "الشروط العامة", content: "<p>مرحباً بك في روض الأصيل. باستخدامك لهذا الموقع، فإنك توافق على الالتزام بالشروط والأحكام التالية. يرجى قراءتها بعناية قبل استخدام خدماتنا.</p><h3>استخدام الموقع</h3><p>باستخدامك روض الأصيل، فإنك تؤكد أنك تبلغ من العمر 18 عاماً على الأقل أو أنك تستخدم الموقع بإشراف أحد الوالدين أو الوصي. أنت مسؤول عن الحفاظ على سرية حسابك وكلمة المرور الخاصة بك.</p><h3>معلومات المنتج</h3><p>نسعى لعرض أوصاف وصور وأسعار دقيقة للمنتجات. لا نضمن أن تكون الأوصاف أو المحتوى الآخر خالية من الأخطاء أو شاملة أو محدثة. نحتفظ بالحق في تصحيح أي أخطاء وتحديث المعلومات في أي وقت.</p><h3>التسعير</h3><p>جميع الأسعار بالريال السعودي (SAR) وتشمل الضنائب المطبقة (ضريبة القيمة المضافة). نحتفظ بالحق في تعديل الأسعار في أي وقت. الرموز الترويجية والخصومات تخضع لشروط محددة ولا يجوز الجمع بينها.</p><h3>قبول الطلب</h3><p>نحتفظ بالحق في رفض أو إلغاء أي طلب لأسباب تشمل على سبيل المثال لا الحصر سوء توافر المنتج، أو أخطاء التسعير، أو الاشتباه في الاحتيال. وفي حال إلغاء الطلب، سيتم استرداد المبلغ كاملاً.</p><h3>حماية المستهلك وسلامة الغذاء</h3><p>جميع منتجات الأغذية المعلبة المعروضة في الموقع تخضع لمعايير الهيئة العامة للغذاء والدواء (SFDA) ولوائح حماية المستهلك المعمول بها في المملكة العربية السعودية.</p>" }
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
