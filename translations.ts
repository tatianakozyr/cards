import { Language } from "./types";

export const translations = {
  uk: {
    headerTitle: "Fashion Studio",
    heroTitle: "Створіть ідеальну картку товару",
    heroSubtitle: "Завантажте одне фото одягу, а наш AI створить 15 професійних варіантів (квадратні 1:1) для вашого магазину.",
    uploadTitle: "Завантажте або перетягніть фото",
    uploadSubtitle: "Натисніть тут, щоб вибрати файл (PNG, JPG)",
    uploadError: "Будь ласка, завантажте зображення (JPEG, PNG).",
    changePhoto: "Змінити фото",
    yourPhoto: "Ваше вихідне фото",
    processing: "Обробка...",
    generateBtn: "Згенерувати 15 Фото",
    generatingBtn: "Генеруємо магію...",
    errorGeneric: "Виникла помилка при з'єднанні з AI сервісом.",
    errorNoImage: "Не вдалося згенерувати зображення. Спробуйте інше фото або пізніше.",
    resultsTitle: "Результати Генерації",
    downloadBtn: "Завантажити",
    retryTitle: "Не сподобався результат?",
    retryBtn: "Перегенерувати",
    prompts: {
      modelFront: "Модель: Вигляд спереду (Без обличчя)",
      modelBack: "Модель: Вигляд ззаду",
      modelProfile: "Модель: Вигляд у профіль",
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
      nature3: "На природі: Асфальт"
    },
    gallerySections: {
      model: "Фото на моделі (Українська зовнішність)",
      flatlay: "Предметна зйомка (Flatlay)",
      macro: "Деталі та фактура (Макро)",
      mannequin: "Об'ємний вигляд (Манекен)",
      nature: "Іміджеві фото на природі",
      review: "Фото відгуки",
      other: "Інше"
    },
    payment: {
      title: "Розблокувати фото",
      description: "Щоб завантажити зображення у високій якості без водяних знаків, будь ласка, здійсніть оплату $4.99.",
      payBtn: "Оплатить $4.99 через PayPal",
      unlockBtn: "Я оплатив, розблокувати",
      watermark: "ПОПЕРЕДНІЙ ПЕРЕГЛЯД"
    },
    singleRegen: {
      editBtn: "Виправити",
      modalTitle: "Виправити це зображення",
      placeholder: "Що виправити? (наприклад: 'прибери манжети', 'зроби фон світлішим', 'розправ складки')",
      submit: "Переробити",
      cancel: "Скасувати",
      regenerating: "Виправляємо..."
    },
    reviews: {
      title: "Генератор Відгуків",
      subtitle: "Створіть 10 реалістичних фото + унікальні текстові відгуки (українська зовнішність, реальні фігури).",
      gender: "Стать",
      age: "Вікова група",
      generateBtn: "Згенерувати 10 Відгуків",
      options: {
        male: "Чоловік",
        female: "Жінка",
        age20_30: "20-30 років",
        age30_40: "30-40 років",
        age40_50: "40-50 років",
        age50_plus: "50+ років"
      },
      scenarios: [
        "З друзями на природі",
        "Відпочинок на дачі",
        "В магазині/ТЦ",
        "Прогулянка містом",
        "З собакою",
        "Спорт/Активність",
        "В кафе",
        "Біля машини",
        "Розпаковка/Огляд",
        "Примірка вдома",
        "Біля річки/озера"
      ]
    }
  },
  en: {
    headerTitle: "Fashion Studio",
    heroTitle: "Create the Perfect Product Card",
    heroSubtitle: "Upload one photo of clothing, and our AI will create 15 professional variations (square 1:1) for your store.",
    uploadTitle: "Upload or drag & drop photo",
    uploadSubtitle: "Click here to select a file (PNG, JPG)",
    uploadError: "Please upload an image (JPEG, PNG).",
    changePhoto: "Change Photo",
    yourPhoto: "Your Source Photo",
    processing: "Processing...",
    generateBtn: "Generate 15 Photos",
    generatingBtn: "Generating magic...",
    errorGeneric: "An error occurred while connecting to the AI service.",
    errorNoImage: "Failed to generate images. Please try another photo or try again later.",
    resultsTitle: "Generation Results",
    downloadBtn: "Download",
    retryTitle: "Didn't like the result?",
    retryBtn: "Regenerate",
    prompts: {
      modelFront: "Model: Front View (Faceless)",
      modelBack: "Model: Back View",
      modelProfile: "Model: Profile View",
      flatlayDecor: "Flatlay: Studio with Decor",
      flatlayShoes: "Flatlay: With Shoes (Diff. Background)",
      flatlayAccessories: "Flatlay: With Accessories (Diff. Background)",
      mannequinFar: "Floating: Full View (Far)",
      mannequinClose: "Floating: Close-up (Zoom)",
      mannequinAngle: "Floating: 3/4 Angle",
      macroCollar: "Macro: Collar/Neckline",
      macroCuff: "Macro: Cuff/Sleeve",
      macroPocket: "Macro: Pocket/Texture",
      nature1: "Nature: Green Grass",
      nature2: "Nature: Crushed Stone",
      nature3: "Nature: Asphalt"
    },
    gallerySections: {
      model: "Model Photography (Slavic Appearance)",
      flatlay: "Styled Flatlay",
      macro: "Macro Details & Texture",
      mannequin: "Ghost Mannequin",
      nature: "Nature Lifestyle",
      review: "Customer Reviews",
      other: "Other"
    },
    payment: {
      title: "Unlock Photos",
      description: "To download high-quality images without watermarks, please make a payment of $4.99.",
      payBtn: "Pay $4.99 via PayPal",
      unlockBtn: "I have paid, unlock now",
      watermark: "PREVIEW"
    },
    singleRegen: {
      editBtn: "Fix / Edit",
      modalTitle: "Refine this Image",
      placeholder: "What to fix? (e.g., 'remove cuffs', 'make background lighter', 'smooth out folds')",
      submit: "Remake",
      cancel: "Cancel",
      regenerating: "Refining..."
    },
    reviews: {
      title: "Review Generator",
      subtitle: "Create 10 realistic 'customer' photos + unique text reviews (Ukrainian appearance, real body types).",
      gender: "Gender",
      age: "Age Group",
      generateBtn: "Generate 10 Reviews",
      options: {
        male: "Male",
        female: "Female",
        age20_30: "20-30 years",
        age30_40: "30-40 years",
        age40_50: "40-50 years",
        age50_plus: "50+ years"
      },
      scenarios: [
        "Nature with friends",
        "Dacha/Country house",
        "Shopping Mall",
        "City Walk",
        "With a Dog",
        "Sport/Activity",
        "At a Cafe",
        "Near Car",
        "Unboxing/Review",
        "Home Try-on",
        "River/Lake"
      ]
    }
  },
  ru: {
    headerTitle: "Fashion Studio",
    heroTitle: "Создайте идеальную карточку товара",
    heroSubtitle: "Загрузите одно фото одежды, а наш AI создаст 15 профессиональных вариантов (квадрат 1:1) для вашего магазина.",
    uploadTitle: "Загрузите или перетащите фото",
    uploadSubtitle: "Нажмите здесь, чтобы выбрать файл (PNG, JPG)",
    uploadError: "Пожалуйста, загрузите изображение (JPEG, PNG).",
    changePhoto: "Изменить фото",
    yourPhoto: "Ваше исходное фото",
    processing: "Обработка...",
    generateBtn: "Сгенерировать 15 Фото",
    generatingBtn: "Генерируем магию...",
    errorGeneric: "Возникла ошибка при соединении с AI сервисом.",
    errorNoImage: "Не удалось сгенерировать изображения. Попробуйте другое фото или позже.",
    resultsTitle: "Результаты Генерации",
    downloadBtn: "Скачать",
    retryTitle: "Не понравился результат?",
    retryBtn: "Перегенерировать",
    prompts: {
      modelFront: "Модель: Вид спереди (Без лица)",
      modelBack: "Модель: Вид сзади",
      modelProfile: "Модель: Вид в профиль",
      flatlayDecor: "Раскладка: Студия с декором",
      flatlayShoes: "Раскладка: С обувью (Др. фон)",
      flatlayAccessories: "Раскладка: С аксессуарами (Др. фон)",
      mannequinFar: "В воздухе: Общий план (Далеко)",
      mannequinClose: "В воздухе: Крупный план (Близко)",
      mannequinAngle: "В воздухе: Ракурс 3/4",
      macroCollar: "Макро: Воротник",
      macroCuff: "Макро: Манжет",
      macroPocket: "Макро: Карман/Фактура",
      nature1: "На природе: Зеленая Трава",
      nature2: "На природе: Щебень",
      nature3: "На природе: Асфальт"
    },
    gallerySections: {
      model: "Фото на модели (Украинская внешность)",
      flatlay: "Предметная съемка (Flatlay)",
      macro: "Детали и фактура (Макро)",
      mannequin: "Объемный вид (Манекен)",
      nature: "Имиджевые фото на природе",
      review: "Фото отзывы",
      other: "Другое"
    },
    payment: {
      title: "Разблокировать фото",
      description: "Чтобы скачать изображения в высоком качестве без водяных знаков, пожалуйста, произведите оплату $4.99.",
      payBtn: "Оплатить $4.99 через PayPal",
      unlockBtn: "Я оплатил, разблокировать",
      watermark: "ПРЕДПРОСМОТР"
    },
    singleRegen: {
      editBtn: "Исправить",
      modalTitle: "Исправить это изображение",
      placeholder: "Что исправить? (например: 'убери манжеты', 'сделай фон светлее', 'расправь складки')",
      submit: "Переделать",
      cancel: "Отмена",
      regenerating: "Исправляем..."
    },
    reviews: {
      title: "Генератор Отзывов",
      subtitle: "Создайте 10 реалистичных фото + уникальные текстовые отзывы (украинская внешность, реальные фигуры).",
      gender: "Пол",
      age: "Возрастная группа",
      generateBtn: "Сгенерировать 10 Отзывов",
      options: {
        male: "Мужчина",
        female: "Женщина",
        age20_30: "20-30 лет",
        age30_40: "30-40 лет",
        age40_50: "40-50 лет",
        age50_plus: "50+ лет"
      },
      scenarios: [
        "С друзьями на природе",
        "Отдых на даче",
        "В магазине/ТЦ",
        "Прогулка по городу",
        "С собакой",
        "Спорт/Активность",
        "В кафе",
        "Возле машины",
        "Распаковка/Обзор",
        "Примерка дома",
        "У реки/озера"
      ]
    }
  }
};

export type Translation = typeof translations.uk;