/**
 * Таблиця українсько-латинської транслітерації (на базі офіційного стандарту КМУ №55).
 * Забезпечує коректну генерацію людинозрозумілих URL-ідентифікаторів (slugs) для
 * курсів, модулів, компетенцій та конспектів уроків.
 */
const UKRAINIAN_TRANSLIT_MAP: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'h',
  ґ: 'g',
  д: 'd',
  е: 'e',
  є: 'ye',
  ж: 'zh',
  з: 'z',
  и: 'y',
  і: 'i',
  ї: 'yi',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'kh',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'shch',
  ь: '',
  ю: 'yu',
  я: 'ya',
  // Додаткові літери для сумісності з іншими кириличними текстами
  ё: 'yo',
  ы: 'y',
  э: 'e',
  ъ: '',
  // Апострофи вилучаються
  "'": '',
  '’': '',
  '`': '',
};

/**
 * Транслітерує український або кириличний текст у латиницю.
 */
export function transliterateUkrainian(text: string): string {
  if (!text) return '';
  return text
    .split('')
    .map((char) => {
      const lower = char.toLowerCase();
      if (lower in UKRAINIAN_TRANSLIT_MAP) {
        return UKRAINIAN_TRANSLIT_MAP[lower];
      }
      return char;
    })
    .join('');
}

export interface SlugifyOptions {
  maxLength?: number;
}

/**
 * Автоматично перетворює довільний заголовок (українською або англійською) у валідний URL-slug.
 * Наприклад: "Інтерактивні форми та валідація" -> "interaktyvni-formy-ta-validatsiya"
 */
export function slugify(text: string, options?: SlugifyOptions): string {
  if (!text) return '';

  const maxLength = options?.maxLength ?? 60;

  // 1. Транслітерація кирилиці
  let result = transliterateUkrainian(text);

  // 2. Заміна спецсимволів на розмовні еквіваленти
  result = result
    .replace(/&/g, ' and ')
    .replace(/\+/g, ' plus ')
    .replace(/@/g, ' at ');

  // 3. Переведення в нижній регістр та очищення від нелатинських символів
  result = result
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // Будь-які нецифрові/нелатинські знаки -> дефіс
    .replace(/^-+|-+$/g, '') // Обрізати крайові дефіси
    .replace(/-{2,}/g, '-'); // Замінити повторювані дефіси на один

  // 4. Обмеження довжини зі збереженням цілісності слова
  if (result.length > maxLength) {
    result = result.slice(0, maxLength).replace(/-+$/, '');
  }

  return result;
}

export interface SlugValidationResult {
  isValid: boolean;
  error?: string;
}

export interface SlugValidationOptions {
  existingSlugs?: string[];
  currentSlug?: string;
  maxLength?: number;
}

/**
 * Сувора валідація URL-ідентифікатора (slug) для модулів, курсів та компетенцій.
 */
export function validateSlug(slug: string, options?: SlugValidationOptions): SlugValidationResult {
  if (!slug || !slug.trim()) {
    return { isValid: false, error: 'Слаг не може бути порожнім' };
  }

  const trimmed = slug.trim();
  const maxLength = options?.maxLength ?? 60;

  if (trimmed.length > maxLength) {
    return { isValid: false, error: `Слаг занадто довгий (максимум ${maxLength} символів)` };
  }

  if (/[а-яА-ЯіїєґІЇЄҐёЁыЫэЭ]/.test(trimmed)) {
    return { isValid: false, error: 'Слаг не може містити кириличні літери. Використовуйте латиницю.' };
  }

  if (trimmed !== trimmed.toLowerCase()) {
    return { isValid: false, error: 'Слаг повинен містити лише малі літери (lowercase)' };
  }

  if (/\s/.test(trimmed)) {
    return { isValid: false, error: 'Слаг не може містити пробіли' };
  }

  if (/--/.test(trimmed)) {
    return { isValid: false, error: 'Слаг не повинен містити подвійних дефісів (--)' };
  }

  if (/^-|-$/.test(trimmed)) {
    return { isValid: false, error: 'Слаг не може починатися або закінчуватися дефісом' };
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmed)) {
    return { isValid: false, error: 'Дозволені лише малі латинські літери (a-z), цифри (0-9) та дефіс (-)' };
  }

  if (options?.existingSlugs) {
    const isDuplicate = options.existingSlugs.some(
      (s) => s.toLowerCase() === trimmed.toLowerCase() && s.toLowerCase() !== options?.currentSlug?.toLowerCase()
    );
    if (isDuplicate) {
      return { isValid: false, error: 'Елемент із таким слагом вже існує у цьому курсі' };
    }
  }

  return { isValid: true };
}
