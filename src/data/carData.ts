import { CarCategory } from '../types';

export interface CarModelData {
  name: string;
  category: CarCategory;
  categoryLabel: string;
  trims: string[];
}

export interface CarBrandData {
  name: string;
  enName: string;
  models: CarModelData[];
}

export const CAR_BRANDS_DATA: CarBrandData[] = [
  {
    name: 'تويوتا',
    enName: 'Toyota',
    models: [
      { name: 'كامري', category: 'sedan', categoryLabel: 'سيدان', trims: ['LE ستاندرد', 'GLE نص فل', 'قراندي V6', 'هايبرد HEV'] },
      { name: 'كورولا', category: 'sedan', categoryLabel: 'سيدان', trims: ['XLI 1.5L', 'GLI 2.0L', 'هايبرد HEV'] },
      { name: 'لاندكروزر', category: 'suv', categoryLabel: 'جيب عائلي / دفع رباعي', trims: ['GXR', 'VXR توربو', 'GR سبورت الرياضي'] },
      { name: 'برادو', category: 'suv', categoryLabel: 'جيب متوسط', trims: ['TXL 1', 'TXL 2', 'VXR فل كامل'] },
      { name: 'راف 4 (RAV4)', category: 'suv', categoryLabel: 'كروس أوفر', trims: ['LE دفع ثنائي', 'XLE دفع رباعي', 'هايبرد LTD'] },
      { name: 'فورتشنر', category: 'suv', categoryLabel: 'جيب 7 ركاب', trims: ['GX2 بنزين', 'VX1 دبل', 'VX3 فل'] },
      { name: 'يارس', category: 'small', categoryLabel: 'سيارة صغيرة', trims: ['Y ستاندرد', 'Y Plus', 'YX فل كامل'] },
      { name: 'هايلكس', category: 'suv', categoryLabel: 'بيك اب / دفع رباعي', trims: ['غمارتين GLX', 'ادفنتشر 4x4', 'GR-S'] },
      { name: 'كراون', category: 'luxury', categoryLabel: 'سيدان فاخرة', trims: ['بريميوم هايبرد', 'ماجيستا توربو'] },
      { name: 'افالون', category: 'luxury', categoryLabel: 'سيدان فاخرة', trims: ['XLE', 'تورينغ', 'بريميوم'] },
    ]
  },
  {
    name: 'هيونداي',
    enName: 'Hyundai',
    models: [
      { name: 'سوناتا', category: 'sedan', categoryLabel: 'سيدان', trims: ['فليت سمارت', 'كومفورت', 'بريميوم', 'N-Line الرياضية'] },
      { name: 'النترا', category: 'sedan', categoryLabel: 'سيدان', trims: ['فليت', 'سمارت 1.6L', 'كومفورت 2.0L', 'N-Line'] },
      { name: 'توسان', category: 'suv', categoryLabel: 'كروس أوفر', trims: ['سمارت 2.0L', 'كومفورت توربو', 'بريميوم دبل'] },
      { name: 'سانتافي', category: 'suv', categoryLabel: 'جيب عائلي', trims: ['كومفورت', 'بريميوم 2.5L توربو', 'كاليغرافي VIP'] },
      { name: 'اكسنت', category: 'small', categoryLabel: 'سيارة صغيرة', trims: ['سمارت', 'كومفورت فل كامل'] },
      { name: 'كريتا', category: 'suv', categoryLabel: 'كروس أوفر صغيرة', trims: ['سمارت', 'ميد', 'بريميوم'] },
      { name: 'باليسيد', category: 'suv', categoryLabel: 'جيب كبير فاخر', trims: ['سمارت 3.8L', 'بريميوم AWD', 'كاليغرافي VIP'] },
      { name: 'ازيرا', category: 'luxury', categoryLabel: 'سيدان فاخرة', trims: ['كلاسيك', 'إكسكلوسيف', 'كاليغرافي'] },
    ]
  },
  {
    name: 'نيسان',
    enName: 'Nissan',
    models: [
      { name: 'باترول', category: 'suv', categoryLabel: 'بطل الدروب / جيب', trims: ['SE تيتانيوم V6', 'LE بلاتينيوم V8', 'نيسمو NISMO'] },
      { name: 'التيما', category: 'sedan', categoryLabel: 'سيدان', trims: ['S ستاندرد', 'SV نص فل', 'SL فل كامل'] },
      { name: 'صني', category: 'small', categoryLabel: 'سيارة صغيرة', trims: ['S', 'SV', 'SL فل كامل'] },
      { name: 'اكس تريل', category: 'suv', categoryLabel: 'كروس أوفر', trims: ['S دفع ثنائي', 'SV دفع رباعي', 'SL فل 7 مقاعد'] },
      { name: 'ماكسيما', category: 'sedan', categoryLabel: 'سيدان رياضية', trims: ['SV', 'SR سبورت', 'بلاتينيوم'] },
      { name: 'باثفايندر', category: 'suv', categoryLabel: 'جيب عائلي', trims: ['SV دفع رباعي', 'SL فل كامل'] },
    ]
  },
  {
    name: 'مرسيدس بنز',
    enName: 'Mercedes-Benz',
    models: [
      { name: 'الفئة S (S-Class)', category: 'luxury', categoryLabel: 'فاخرة رئاسية VIP', trims: ['S 450 4MATIC', 'S 500 AMG', 'مايباخ Maybach S 580'] },
      { name: 'الفئة E (E-Class)', category: 'luxury', categoryLabel: 'سيدان فاخرة', trims: ['E 200 أفانت جارد', 'E 300 AMG Line'] },
      { name: 'الفئة C (C-Class)', category: 'luxury', categoryLabel: 'سيدان متوسطة', trims: ['C 200', 'C 300 AMG Line'] },
      { name: 'جي كلاس (G-Class)', category: 'luxury', categoryLabel: 'دفع رباعي فاخر أسطوري', trims: ['G 500', 'G 63 AMG الفاخرة'] },
      { name: 'GLE', category: 'luxury', categoryLabel: 'جيب SUV فاخر', trims: ['GLE 450 4MATIC', 'GLE 53 AMG'] },
      { name: 'GLC', category: 'luxury', categoryLabel: 'كروس أوفر فاخر', trims: ['GLC 200', 'GLC 300 AMG Line'] },
    ]
  },
  {
    name: 'بي إم دبليو',
    enName: 'BMW',
    models: [
      { name: 'الفئة السابعة (Series 7)', category: 'luxury', categoryLabel: 'فاخرة VIP', trims: ['735i M Sport', '740i Pure Excellence', 'i7 كهربائية بالكامل'] },
      { name: 'الفئة الخامسة (Series 5)', category: 'luxury', categoryLabel: 'سيدان تنفيذية', trims: ['520i', '530i M Sport'] },
      { name: 'الفئة الثالثة (Series 3)', category: 'sedan', categoryLabel: 'سيدان رياضية', trims: ['320i', '330i M Sport'] },
      { name: 'X5', category: 'luxury', categoryLabel: 'جيب SUV فاخر', trims: ['xDrive40i', 'M60i V8'] },
      { name: 'X7', category: 'luxury', categoryLabel: 'جيب عائلي فاخر 7 مقاعد', trims: ['xDrive40i M Sport', 'M60i الفاخرة'] },
      { name: 'X6', category: 'luxury', categoryLabel: 'SUV كوبيه رياضي', trims: ['xDrive40i', 'X6 M Competition'] },
    ]
  },
  {
    name: 'لكزس',
    enName: 'Lexus',
    models: [
      { name: 'ES', category: 'luxury', categoryLabel: 'سيدان فاخرة', trims: ['ES 250 بريميوم', 'ES 350 إيليت', 'ES 300h هايبرد'] },
      { name: 'LX 600', category: 'luxury', categoryLabel: 'جيب VIP فائق الفخامة', trims: ['برستيج', 'إف سبورت F-Sport', 'VIP إكسكلوسيف'] },
      { name: 'RX', category: 'luxury', categoryLabel: 'كروس أوفر فاخر', trims: ['RX 350 إكسلنس', 'RX 500h F-Sport هايبرد'] },
      { name: 'NX', category: 'luxury', categoryLabel: 'كروس أوفر مدمج', trims: ['NX 350 بريميوم', 'NX 350h هايبرد'] },
      { name: 'GX', category: 'luxury', categoryLabel: 'جيب SUV فاخر', trims: ['بلاتينيوم', 'أوفر تريل Overtrail'] },
      { name: 'IS', category: 'sedan', categoryLabel: 'سيدان مدمجة رياضية', trims: ['IS 300 كلاسيك', 'IS 350 F-Sport'] },
    ]
  },
  {
    name: 'فورد',
    enName: 'Ford',
    models: [
      { name: 'تورس', category: 'sedan', categoryLabel: 'سيدان', trims: ['أمبيانتي', 'تريند نص فل', 'تيتانيوم فل كامل'] },
      { name: 'اكسبلورر', category: 'suv', categoryLabel: 'جيب عائلي 7 مقاعد', trims: ['XLT دبل', 'ليمتد فل كامل', 'ST الرياضي توربو'] },
      { name: 'F-150', category: 'suv', categoryLabel: 'بيك اب كبير', trims: ['XLT غمارتين', 'لاريات Lariat', 'رابتر Raptor'] },
      { name: 'اكسبيديشن', category: 'suv', categoryLabel: 'جيب عائلي ضخم', trims: ['XLT', 'ليمتد 4x4', 'كينج رانش King Ranch'] },
      { name: 'تيريتوري', category: 'suv', categoryLabel: 'كروس أوفر', trims: ['أمبيانتي', 'تريند', 'تيتانيوم فل'] },
    ]
  },
  {
    name: 'كيا',
    enName: 'Kia',
    models: [
      { name: 'K5', category: 'sedan', categoryLabel: 'سيدان رياضية', trims: ['LX ستاندرد', 'EX نص فل', 'GT-Line فل كامل'] },
      { name: 'سبورتاج', category: 'suv', categoryLabel: 'كروس أوفر', trims: ['LX 2.0L', 'EX توربو', 'GT-Line دبل'] },
      { name: 'سيراتو', category: 'sedan', categoryLabel: 'سيدان', trims: ['LX', 'EX فل كامل'] },
      { name: 'تيلورايد', category: 'suv', categoryLabel: 'جيب عائلي كبير', trims: ['LX', 'EX دبل', 'SX فل كامل'] },
      { name: 'سورينتو', category: 'suv', categoryLabel: 'جيب 7 مقاعد', trims: ['LX', 'EX', 'فل كامل V6'] },
      { name: 'بيجاس', category: 'small', categoryLabel: 'سيارة صغيرة اقتصادية', trims: ['LX', 'EX'] },
    ]
  },
  {
    name: 'جي إم سي',
    enName: 'GMC',
    models: [
      { name: 'يوكن', category: 'suv', categoryLabel: 'جيب عائلي كبير', trims: ['SLE دبل', 'SLT', 'AT4 للمغامرات', 'دينالي Denali الفاخر'] },
      { name: 'سييرا', category: 'suv', categoryLabel: 'بيك اب دفع رباعي', trims: ['Elevation', 'AT4 رالي', 'دينالي فاخر'] },
      { name: 'اكاديا', category: 'suv', categoryLabel: 'جيب كروس أوفر 7 ركاب', trims: ['SLE', 'SLT', 'AT4', 'دينالي'] },
    ]
  },
  {
    name: 'شيفروليه',
    enName: 'Chevrolet',
    models: [
      { name: 'تاهو', category: 'suv', categoryLabel: 'جيب كبير', trims: ['LS', 'LT دبل', 'Z71 أوف رود', 'بريمير Premier'] },
      { name: 'سوبربان', category: 'suv', categoryLabel: 'جيب عائلي طويل', trims: ['LT دبل', 'Z71', 'بريمير فل'] },
      { name: 'كابتيفا', category: 'suv', categoryLabel: 'كروس أوفر 7 مقاعد', trims: ['LS', 'LT', 'بريمير'] },
      { name: 'ماليبو', category: 'sedan', categoryLabel: 'سيدان', trims: ['LS توربو', 'LT', 'بريمير فل'] },
    ]
  },
  {
    name: 'مازدا',
    enName: 'Mazda',
    models: [
      { name: 'مازدا 6', category: 'sedan', categoryLabel: 'سيدان يابانية', trims: ['كلاسيك', 'سنتر', 'إجنايت Ignite', 'سيجنتشر فل'] },
      { name: 'CX-5', category: 'suv', categoryLabel: 'كروس أوفر', trims: ['أكتيف', 'كومفورت AWD', 'بريميوم سيجنتشر'] },
      { name: 'CX-9 / CX-90', category: 'suv', categoryLabel: 'جيب فاخر 7 ركاب', trims: ['بريميوم', 'إجنايت', 'هاي بلس High Plus'] },
      { name: 'مازدا 3', category: 'small', categoryLabel: 'سيدان صغيرة', trims: ['كلاسيك', 'سنتر فل كامل'] },
    ]
  },
  {
    name: 'لوسيد',
    enName: 'Lucid',
    models: [
      { name: 'Air', category: 'luxury', categoryLabel: 'سيدان كهربائية فائقة الفخامة', trims: ['Air Pure', 'Air Touring', 'Air Grand Touring', 'Sapphire'] },
    ]
  },
  {
    name: 'جينيسيس',
    enName: 'Genesis',
    models: [
      { name: 'G80', category: 'luxury', categoryLabel: 'سيدان فخمة', trims: ['برستيج 2.5T', 'رويال 3.5T AWD'] },
      { name: 'GV80', category: 'luxury', categoryLabel: 'جيب SUV فاخر', trims: ['برستيج', 'رويال فل كامل V6'] },
      { name: 'G70', category: 'luxury', categoryLabel: 'سيدان سبورت فاخرة', trims: ['بريميوم', 'سبورت توربو'] },
      { name: 'G90', category: 'luxury', categoryLabel: 'فاخرة VIP رئاسية', trims: ['رويال', 'ليموزين مصفحة'] },
    ]
  },
  {
    name: 'شانجان',
    enName: 'Changan',
    models: [
      { name: 'UNI-K', category: 'suv', categoryLabel: 'كروس أوفر مستقبلي فاخر', trims: ['إيليت فل كامل AWD'] },
      { name: 'UNI-V', category: 'sedan', categoryLabel: 'سيدان رياضية كوبيه', trims: ['إيليت سبورت'] },
      { name: 'CS95', category: 'suv', categoryLabel: 'جيب عائلي 7 مقاعد', trims: ['بلاتينيوم', 'رويال 4WD فل'] },
      { name: 'CS85', category: 'suv', categoryLabel: 'كروس أوفر كوبيه', trims: ['ليمتد فل كامل'] },
      { name: 'CS75 بلس', category: 'suv', categoryLabel: 'كروس أوفر', trims: ['سمارت', 'ليمتد فل'] },
      { name: 'السفن (Alsvin)', category: 'small', categoryLabel: 'سيارة صغيرة اقتصادية', trims: ['بيسك', 'فل كامل'] },
    ]
  },
  {
    name: 'جيلي',
    enName: 'Geely',
    models: [
      { name: 'كولراي (Coolray)', category: 'suv', categoryLabel: 'كروس أوفر شبابي', trims: ['GL', 'GK', 'GF سبورت فل'] },
      { name: 'مونجارو (Monjaro)', category: 'suv', categoryLabel: 'جيب SUV فاخر 4WD', trims: ['كومفورت', 'بريميوم', 'ألتيميت ليمتد'] },
      { name: 'توجيلا (Tugella)', category: 'suv', categoryLabel: 'SUV كوبيه', trims: ['GL دبل', 'GF فل كامل'] },
      { name: 'امجراند (Emgrand)', category: 'sedan', categoryLabel: 'سيدان اقتصادية', trims: ['GS', 'GK فل'] },
    ]
  },
  {
    name: 'هافال',
    enName: 'Haval',
    models: [
      { name: 'H6', category: 'suv', categoryLabel: 'كروس أوفر متطور', trims: ['بيسك', 'ديلوكس', 'سوبر ديلوكس دبل'] },
      { name: 'جوليان (Jolion)', category: 'suv', categoryLabel: 'كروس أوفر شبابي', trims: ['بيسك', 'ديلوكس فل'] },
      { name: 'دارجو (Dargo)', category: 'suv', categoryLabel: 'جيب دفع رباعي مغامرات', trims: ['سبورت', 'أدفنشر دبل'] },
    ]
  },
  {
    name: 'إم جي',
    enName: 'MG',
    models: [
      { name: 'MG GT', category: 'sedan', categoryLabel: 'سيدان رياضية', trims: ['STD', 'COM', 'LUX توربو فل'] },
      { name: 'MG 6', category: 'sedan', categoryLabel: 'سيدان عائلية', trims: ['STD', 'COM', 'LUX فل'] },
      { name: 'RX8', category: 'suv', categoryLabel: 'جيب 7 ركاب دفع رباعي', trims: ['STD', 'COM', 'LUX دبل'] },
      { name: 'ZS', category: 'suv', categoryLabel: 'كروس أوفر مدمج', trims: ['STD', 'COM', 'LUX'] },
      { name: 'MG 5', category: 'small', categoryLabel: 'سيارة صغيرة', trims: ['STD', 'COM', 'DEL فل'] },
    ]
  }
];

export interface SearchCarResult {
  brand: string;
  model: string;
  category: CarCategory;
  categoryLabel: string;
  defaultTrim: string;
}

export function searchCarCatalogue(query: string): SearchCarResult[] {
  if (!query || query.trim().length === 0) return [];
  const q = query.trim().toLowerCase();

  const results: SearchCarResult[] = [];

  for (const b of CAR_BRANDS_DATA) {
    const brandMatches = b.name.toLowerCase().includes(q) || b.enName.toLowerCase().includes(q);

    for (const m of b.models) {
      const modelMatches = m.name.toLowerCase().includes(q);

      if (brandMatches || modelMatches) {
        results.push({
          brand: b.name,
          model: m.name,
          category: m.category,
          categoryLabel: m.categoryLabel,
          defaultTrim: m.trims[0] || 'ستاندرد'
        });
      }
    }
  }

  return results.slice(0, 8);
}
