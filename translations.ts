import { Language } from "./types";

export const translations = {
  uk: {
    headerTitle: "Fashion Studio",
    heroTitle: "Створіть ідеальну картку товару",
    heroSubtitle: "Завантажте фото, та генеруйте професійні кадри окремими блоками.",
    uploadTitle: "Завантажте або перетягніть фото",
    uploadSubtitle: "Натисніть тут, щоб вибрати файл (PNG, JPG)",
    uploadError: "Будь ласка, завантажте зображення (JPEG, PNG).",
    changePhoto: "Змінити фото",
    yourPhoto: "Ваше вихідне фото",
    processing: "Обробка...",
    generateBtn: "Згенерувати",
    generatingBtn: "Генеруємо...",
    errorGeneric: "Виникла помилка при з'єднанні з AI сервісом.",
    errorNoImage: "Не вдалося згенерувати зображення. Спробуйте інше фото.",
    resultsTitle: "Результати Генерації",
    downloadBtn: "Завантажити",
    retryTitle: "Не сподобався результат?",
    retryBtn: "Перегенерувати",
    prompts: {
      modelFront: "Модель: Вигляд спереду (Обличчя поза кадром)",
      modelBack: "Модель: Вигляд ззаду (Без голови)",
      modelProfile: "Модель: Вигляд у профіль (Обличчя поза кадром)",
      flatlayDecor: "Розкладка: Студія з декором",
      flatlayShoes: "Розкладка: З взуттям (Інший фон)",
      flatlayAccessories: "Розкладка: З аксесуарами (Інший фон)",
      mannequinFar: "В повітрі: Загальний план (Далеко)",
      mannequinClose: "В повітрі: Крупний план (Близько)",
      mannequinAngle: "В повітрі: Ракурс 3/4 (Динаміка)",
      macroCollar: "Макро: Комір/Горловина",
      macroCuff: "Макро: Манжет/Рукав",
      macroPocket: "Макро: Кишеня/Фактура",
      nature1: "На природі: Зелена Трава",
      nature2: "На природі: Щебінь",
      nature3: "На природі: Сланець / Кам'яна плита"
    },
    gallerySections: {
      model: "Фото на моделі",
      flatlay: "Предметна зйомка",
      macro: "Деталі та фактура",
      mannequin: "Одяг у повітрі (Манекен)",
      nature: "Фото на природі",
      review: "Відгуки покупців",
      other: "Інше"
    },
    payment: {
      title: "Розблокувати фото",
      description: "Оплатіть для видалення водяних знаків.",
      payBtn: "Оплатити $4.99",
      unlockBtn: "Розблокувати",
      watermark: "PREVIEW"
    },
    singleRegen: {
      editBtn: "Виправити",
      modalTitle: "Виправити це зображення",
      placeholder: "Наприклад: 'прибери манжети', 'зроби фон світлішим'",
      submit: "Переробити",
      cancel: "Скасувати",
      regenerating: "Виправляємо...",
      limitReached: "Ліміт виправлень (3) вичерпано",
      remaining: "Залишилось виправлень: "
    },
    reviews: {
      title: "Генератор Відгуків",
      subtitle: "10 реалістичних фото + текстові відгуки.",
      gender: "Стать",
      age: "Вікова група",
      generateBtn: "Згенерувати Відгуки",
      options: {
        male: "Чоловік",
        female: "Жінка",
        age30_40: "30-40 років",
        age40_50: "40-50 років",
        age50_plus: "50+ років"
      },
      scenarios: [
        "На природі", "На дачі", "В ТЦ", "Місто", "З собакою", 
        "Спорт", "Кафе", "Біля авто", "Розпаковка", "Вдома", "Біля води"
      ]
    }
  },
  en: {
    headerTitle: "Fashion Studio",
    heroTitle: "The Best Product Photography",
    heroSubtitle: "Upload a photo and generate professional blocks of content.",
    uploadTitle: "Upload or drag & drop",
    uploadSubtitle: "PNG, JPG supported",
    uploadError: "Please upload an image.",
    changePhoto: "Change",
    yourPhoto: "Source Image",
    processing: "Processing...",
    generateBtn: "Generate",
    generatingBtn: "Generating...",
    errorGeneric: "AI Service Error.",
    errorNoImage: "Failed to generate.",
    resultsTitle: "Studio Results",
    downloadBtn: "Download",
    retryTitle: "Need a change?",
    retryBtn: "Regenerate",
    prompts: {
      modelFront: "Model: Front View",
      modelBack: "Model: Back View",
      modelProfile: "Model: Profile View",
      flatlayDecor: "Flatlay: Studio",
      flatlayShoes: "Flatlay: Shoes",
      flatlayAccessories: "Flatlay: Accessories",
      mannequinFar: "Floating: Far",
      mannequinClose: "Floating: Zoom",
      mannequinAngle: "Floating: 3/4",
      macroCollar: "Macro: Collar",
      macroCuff: "Macro: Cuff",
      macroPocket: "Macro: Detail",
      nature1: "Nature: Grass",
      nature2: "Nature: Stones",
      nature3: "Nature: Slate"
    },
    gallerySections: {
      model: "Model Shots",
      flatlay: "Flatlay",
      macro: "Macro Details",
      mannequin: "Mannequin (Air)",
      nature: "Lifestyle Nature",
      review: "Customer Reviews",
      other: "Other"
    },
    payment: {
      title: "Unlock",
      description: "Pay to remove watermarks.",
      payBtn: "Pay $4.99",
      unlockBtn: "Unlock",
      watermark: "PREVIEW"
    },
    singleRegen: {
      editBtn: "Fix",
      modalTitle: "Refine Image",
      placeholder: "e.g. 'remove shadows', 'lighter background'",
      submit: "Regenerate",
      cancel: "Cancel",
      regenerating: "Refining...",
      limitReached: "Max fixes (3) reached",
      remaining: "Fixes left: "
    },
    reviews: {
      title: "Review Generator",
      subtitle: "10 realistic photos + text reviews.",
      gender: "Gender",
      age: "Age",
      generateBtn: "Generate Reviews",
      options: {
        male: "Male",
        female: "Female",
        age30_40: "30-40 years",
        age40_50: "40-50 years",
        age50_plus: "50+ years"
      },
      scenarios: [
        "Nature", "Country", "Mall", "City", "With Dog", 
        "Sport", "Cafe", "Car", "Unboxing", "Home", "River"
      ]
    }
  },
  ru: {
    headerTitle: "Fashion Studio",
    heroTitle: "Идеальная карточка товара",
    heroSubtitle: "Загрузите фото и генерируйте кадры отдельными блоками.",
    uploadTitle: "Загрузите фото",
    uploadSubtitle: "PNG, JPG",
    uploadError: "Загрузите изображение.",
    changePhoto: "Изменить",
    yourPhoto: "Исходное фото",
    processing: "Обработка...",
    generateBtn: "Сгенерировать",
    generatingBtn: "Генерируем...",
    errorGeneric: "Ошибка AI сервиса.",
    errorNoImage: "Не удалось сгенерировать.",
    resultsTitle: "Результаты",
    downloadBtn: "Скачать",
    retryTitle: "Не понравилось?",
    retryBtn: "Переделать",
    prompts: {
      modelFront: "Модель: Спереди",
      modelBack: "Модель: Сзади",
      modelProfile: "Модель: В профиль",
      flatlayDecor: "Раскладка: Студия",
      flatlayShoes: "Раскладка: Обувь",
      flatlayAccessories: "Раскладка: Аксессуары",
      mannequinFar: "В воздухе: Издалека",
      mannequinClose: "В воздухе: Крупно",
      mannequinAngle: "В воздухе: Ракурс",
      macroCollar: "Макро: Воротник",
      macroCuff: "Макро: Манжет",
      macroPocket: "Макро: Деталь",
      nature1: "На природе: Трава",
      nature2: "На природе: Камни",
      nature3: "На природе: Сланец"
    },
    gallerySections: {
      model: "Фото на модели",
      flatlay: "Предметная съемка",
      macro: "Детали и фактура",
      mannequin: "В воздухе (Манекен)",
      nature: "На природе",
      review: "Отзывы",
      other: "Другое"
    },
    payment: {
      title: "Разблокировать",
      description: "Оплатите для удаления водяных знаков.",
      payBtn: "Оплатить $4.99",
      unlockBtn: "Разблокировать",
      watermark: "PREVIEW"
    },
    singleRegen: {
      editBtn: "Исправить",
      modalTitle: "Исправить изображение",
      placeholder: "Например: 'убери воротник', 'сделай фон светлее'",
      submit: "Переделать",
      cancel: "Отмена",
      regenerating: "Исправляем...",
      limitReached: "Лимит исправлений (3) исчерпан",
      remaining: "Осталось исправлений: "
    },
    reviews: {
      title: "Генератор Отзывов",
      subtitle: "10 фото + текстовые отзывы.",
      gender: "Пол",
      age: "Возраст",
      generateBtn: "Сгенерировать Отзывы",
      options: {
        male: "Мужчина",
        female: "Женщина",
        age30_40: "30-40 лет",
        age40_50: "40-50 лет",
        age50_plus: "50+ лет"
      },
      scenarios: [
        "Природа", "Дача", "ТЦ", "Город", "С собакой", 
        "Спорт", "Кафе", "Авто", "Распаковка", "Дома", "Вода"
      ]
    }
  }
};

export type Translation = typeof translations.uk;