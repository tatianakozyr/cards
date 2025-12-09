import { Language } from "./types";

export const translations = {
  uk: {
    headerTitle: "Fashion Studio",
    heroTitle: "Створіть ідеальну картку товару",
    heroSubtitle: "Завантажте одне фото одягу, а наш AI створить 5 професійних варіантів для вашого інтернет-магазину.",
    uploadTitle: "Завантажте фото одягу",
    uploadSubtitle: "Натисніть тут, щоб вибрати файл (PNG, JPG)",
    uploadError: "Будь ласка, завантажте зображення (JPEG, PNG).",
    changePhoto: "Змінити фото",
    yourPhoto: "Ваше вихідне фото",
    processing: "Обробка...",
    generateBtn: "Згенерувати 5 Фото",
    generatingBtn: "Генеруємо магію...",
    errorGeneric: "Виникла помилка при з'єднанні з AI сервісом.",
    errorNoImage: "Не вдалося згенерувати зображення. Спробуйте інше фото або пізніше.",
    resultsTitle: "Результати Генерації",
    downloadBtn: "Завантажити",
    retryTitle: "Не сподобався результат?",
    retryBtn: "Перегенерувати",
    prompts: {
      model: "На моделі (Фас, повний зріст)",
      flatlay: "Стилізована розкладка (Декор, контрастний фон)",
      mannequin: "Манекен (Напівоберт)",
      creativeDetails: "Макро (Блискавка, кишені, текстура)",
      creativeLifestyle: "На природі (Розгорнутий на камінні/траві)"
    },
    payment: {
      title: "Розблокувати фото",
      description: "Щоб завантажити зображення у високій якості без водяних знаків, будь ласка, здійсніть оплату $4.99.",
      payBtn: "Оплатити $4.99 через PayPal",
      unlockBtn: "Я оплатив, розблокувати",
      watermark: "ПОПЕРЕДНІЙ ПЕРЕГЛЯД"
    },
    video: {
      title: "Відео-огляд товару",
      generateBtn: "Згенерувати Відео-огляд (Beta)",
      generating: "Створюємо відео (це може зайняти хвилину)...",
      error: "Не вдалося створити відео. Спробуйте ще раз.",
      desc: "AI створить короткий огляд вашого товару, фокусуючись на деталях та текстурі."
    },
    singleRegen: {
      editBtn: "Виправити",
      modalTitle: "Виправити це зображення",
      placeholder: "Що виправити? (наприклад: 'прибери манжети', 'зроби фон світлішим', 'розправ складки')",
      submit: "Переробити",
      cancel: "Скасувати",
      regenerating: "Виправляємо..."
    }
  },
  en: {
    headerTitle: "Fashion Studio",
    heroTitle: "Create the Perfect Product Card",
    heroSubtitle: "Upload one photo of clothing, and our AI will create 5 professional variations for your online store.",
    uploadTitle: "Upload Clothing Photo",
    uploadSubtitle: "Click here to select a file (PNG, JPG)",
    uploadError: "Please upload an image (JPEG, PNG).",
    changePhoto: "Change Photo",
    yourPhoto: "Your Source Photo",
    processing: "Processing...",
    generateBtn: "Generate 5 Photos",
    generatingBtn: "Generating magic...",
    errorGeneric: "An error occurred while connecting to the AI service.",
    errorNoImage: "Failed to generate images. Please try another photo or try again later.",
    resultsTitle: "Generation Results",
    downloadBtn: "Download",
    retryTitle: "Didn't like the result?",
    retryBtn: "Regenerate",
    prompts: {
      model: "On Model (Front, Full Body)",
      flatlay: "Styled Flat Lay (Decor, Contrasting Background)",
      mannequin: "Mannequin (Semi-profile)",
      creativeDetails: "Macro (Zipper, pockets, texture)",
      creativeLifestyle: "In Nature (Laid flat on stones/grass)"
    },
    payment: {
      title: "Unlock Photos",
      description: "To download high-quality images without watermarks, please make a payment of $4.99.",
      payBtn: "Pay $4.99 via PayPal",
      unlockBtn: "I have paid, unlock now",
      watermark: "PREVIEW"
    },
    video: {
      title: "Product Video Review",
      generateBtn: "Generate Video Review (Beta)",
      generating: "Creating video (this may take a minute)...",
      error: "Failed to create video. Please try again.",
      desc: "AI will create a short review of your item, focusing on details and texture."
    },
    singleRegen: {
      editBtn: "Fix / Edit",
      modalTitle: "Refine this Image",
      placeholder: "What to fix? (e.g., 'remove cuffs', 'make background lighter', 'smooth out folds')",
      submit: "Remake",
      cancel: "Cancel",
      regenerating: "Refining..."
    }
  },
  ru: {
    headerTitle: "Fashion Studio",
    heroTitle: "Создайте идеальную карточку товара",
    heroSubtitle: "Загрузите одно фото одежды, а наш AI создаст 5 профессиональных вариантов для вашего интернет-магазина.",
    uploadTitle: "Загрузите фото одежды",
    uploadSubtitle: "Нажмите здесь, чтобы выбрать файл (PNG, JPG)",
    uploadError: "Пожалуйста, загрузите изображение (JPEG, PNG).",
    changePhoto: "Изменить фото",
    yourPhoto: "Ваше исходное фото",
    processing: "Обработка...",
    generateBtn: "Сгенерировать 5 Фото",
    generatingBtn: "Генерируем магию...",
    errorGeneric: "Возникла ошибка при соединении с AI сервисом.",
    errorNoImage: "Не удалось сгенерировать изображения. Попробуйте другое фото или позже.",
    resultsTitle: "Результаты Генерации",
    downloadBtn: "Скачать",
    retryTitle: "Не понравился результат?",
    retryBtn: "Перегенерировать",
    prompts: {
      model: "На модели (Фас, полный рост)",
      flatlay: "Стилизованная раскладка (Декор, контрастный фон)",
      mannequin: "Манекен (Полуоборот)",
      creativeDetails: "Макро (Молния, карманы, текстура)",
      creativeLifestyle: "На природе (Развернутый на камнях/траве)"
    },
    payment: {
      title: "Разблокировать фото",
      description: "Чтобы скачать изображения в высоком качестве без водяных знаков, пожалуйста, произведите оплату $4.99.",
      payBtn: "Оплатить $4.99 через PayPal",
      unlockBtn: "Я оплатил, разблокировать",
      watermark: "ПРЕДПРОСМОТР"
    },
    video: {
      title: "Видео-обзор товара",
      generateBtn: "Сгенерировать Видео-обзор (Beta)",
      generating: "Создаем видео (это может занять минуту)...",
      error: "Не удалось создать видео. Попробуйте еще раз.",
      desc: "AI создаст короткий обзор вашего товара, фокусируясь на деталях и текстуре."
    },
    singleRegen: {
      editBtn: "Исправить",
      modalTitle: "Исправить это изображение",
      placeholder: "Что исправить? (например: 'убери манжеты', 'сделай фон светлее', 'расправь складки')",
      submit: "Переделать",
      cancel: "Отмена",
      regenerating: "Исправляем..."
    }
  }
};

export type Translation = typeof translations.uk;