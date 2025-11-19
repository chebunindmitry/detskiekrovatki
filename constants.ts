
import { Category, Product } from './types';

export const mockCategories: Category[] = [
  { id: 1, name: 'Детские кроватки', showImage: true, image: 'https://picsum.photos/seed/cat1/300/200', sortOrder: 1, status: true },
  { id: 2, name: 'Комоды и пеленальные столики', showImage: true, image: 'https://picsum.photos/seed/cat2/300/200', sortOrder: 2, status: true },
  { id: 3, name: 'Детские матрасы', showImage: false, sortOrder: 3, status: true },
  { id: 4, name: 'Постельное белье', showImage: true, image: 'https://picsum.photos/seed/cat4/300/200', sortOrder: 4, status: true },
];

export const mockProducts: Product[] = [
  // Детские кроватки (Linked Variants Example)
  { 
    id: 101, 
    categoryId: 1, 
    name: 'Кроватка "Bambini Classic" (Белая)', 
    price: 6490, 
    specialPrice: 5990,
    image: 'https://picsum.photos/seed/crib1/600/600', 
    images: [
      'https://picsum.photos/seed/crib1/600/600',
      'https://picsum.photos/seed/crib1-2/600/600',
      'https://picsum.photos/seed/crib1-3/600/600'
    ],
    sku: 'BAM-001-W',
    stock: 12,
    status: true,
    attributes: [
       { name: 'Материал', text: 'Береза' },
       { name: 'Тип качания', text: 'Колесо-качалка' }
    ],
    variantLabels: ['Цвет'],
    variantValues: ['Белый'],
    variants: [
        { productId: 101, values: ['Белый'] },
        { productId: 105, values: ['Слоновая кость'] }
    ]
  },
  { 
    id: 105, 
    categoryId: 1, 
    name: 'Кроватка "Bambini Classic" (Слоновая кость)', 
    price: 6490, 
    image: 'https://picsum.photos/seed/crib1-ivory/600/600', 
    images: [
      'https://picsum.photos/seed/crib1-ivory/600/600',
    ],
    sku: 'BAM-001-I',
    stock: 8,
    status: true,
    attributes: [
       { name: 'Материал', text: 'Береза' },
       { name: 'Тип качания', text: 'Колесо-качалка' }
    ],
    variantLabels: ['Цвет'],
    variantValues: ['Слоновая кость'],
    variants: [
        { productId: 101, values: ['Белый'] },
        { productId: 105, values: ['Слоновая кость'] }
    ]
  },
  { 
    id: 102, 
    categoryId: 1, 
    name: 'Кроватка-трансформер "Evolvo 7в1"', 
    price: 11990, 
    image: 'https://picsum.photos/seed/crib2/600/600',
    images: [
        'https://picsum.photos/seed/crib2/600/600',
        'https://picsum.photos/seed/crib2-detail/600/600'
    ],
    sku: 'EVO-7IN1',
    stock: 5,
    status: true,
    attributes: [
        { name: 'Форма', text: 'Круглая/Овальная' }
    ]
  },
  { 
    id: 103, 
    categoryId: 1, 
    name: 'Кроватка "Mimi с маятником"', 
    price: 8990, 
    image: 'https://picsum.photos/seed/crib3/600/600',
    images: ['https://picsum.photos/seed/crib3/600/600'],
    sku: 'MIMI-PEN',
    stock: 0,
    status: true,
    options: [{ name: 'Механизм', values: ['Поперечный', 'Продольный'] }] 
  },
  
  // Комоды
  { 
    id: 201, 
    categoryId: 2, 
    name: 'Пеленальный комод "Comfort"', 
    price: 7200, 
    image: 'https://picsum.photos/seed/dresser1/600/600',
    images: ['https://picsum.photos/seed/dresser1/600/600'],
    sku: 'COMF-DR',
    stock: 8,
    status: true,
    options: [{ name: 'Ящики', values: ['3', '4'] }] 
  },
  { 
    id: 202, 
    categoryId: 2, 
    name: 'Комод "Teddy Bear"', 
    price: 8500, 
    image: 'https://picsum.photos/seed/dresser2/600/600',
    images: ['https://picsum.photos/seed/dresser2/600/600'],
    sku: 'TED-BEAR',
    stock: 3,
    status: true
  },
  { 
    id: 203, 
    categoryId: 2, 
    name: 'Пеленальный столик "Simple"', 
    price: 3900, 
    image: 'https://picsum.photos/seed/dresser3/600/600',
    images: ['https://picsum.photos/seed/dresser3/600/600'],
    sku: 'SIM-TAB',
    stock: 15,
    status: false // Hidden product example
  },

  // Матрасы (Multi-dim example)
  { 
    id: 301, 
    categoryId: 3, 
    name: 'Матрас "Baby Dream" 120x60', 
    price: 3500, 
    image: 'https://picsum.photos/seed/mattress1/600/600',
    images: ['https://picsum.photos/seed/mattress1/600/600'],
    sku: 'MAT-120',
    stock: 20,
    status: true,
    variantLabels: ['Размер'],
    variantValues: ['120x60'],
    variants: [
        { productId: 301, values: ['120x60'] },
        { productId: 302, values: ['125x65'] }
    ]
  },
  { 
    id: 302, 
    categoryId: 3, 
    name: 'Матрас "Baby Dream" 125x65', 
    price: 3800, 
    image: 'https://picsum.photos/seed/mattress2/600/600',
    images: ['https://picsum.photos/seed/mattress2/600/600'],
    sku: 'MAT-125',
    stock: 7,
    status: true,
    variantLabels: ['Размер'],
    variantValues: ['125x65'],
    variants: [
        { productId: 301, values: ['120x60'] },
        { productId: 302, values: ['125x65'] }
    ]
  },
  
  // Постельное белье
  { 
    id: 401, 
    categoryId: 4, 
    name: 'Комплект белья "Звездная ночь"', 
    price: 4200, 
    image: 'https://picsum.photos/seed/bedding1/600/600',
    images: ['https://picsum.photos/seed/bedding1/600/600'],
    sku: 'SET-STAR',
    stock: 10,
    status: true,
    options: [{ name: 'Расцветка', values: ['Голубой', 'Розовый'] }] 
  },
  { 
    id: 402, 
    categoryId: 4, 
    name: 'Бортики в кроватку "Облака"', 
    price: 3100, 
    image: 'https://picsum.photos/seed/bedding2/600/600',
    images: ['https://picsum.photos/seed/bedding2/600/600'],
    sku: 'BORT-CLD',
    stock: 2,
    status: true
  },
];

export const TRANSLATIONS = {
  ru: {
    start: {
      catalogButton: 'Перейти в каталог',
      consultationButton: 'Запросить консультацию',
      adminButton: 'Панель администратора',
      adminLogin: 'Администратор'
    },
    catalog: {
      title: 'Каталог',
      searchPlaceholder: 'Поиск...',
      nothingFound: 'Ничего не найдено 😔',
      emptyCategory: 'В этой категории пока нет товаров',
      sort: {
         default: 'По умолчанию',
         priceAsc: 'Сначала дешевые',
         priceDesc: 'Сначала дорогие',
         discountDesc: 'Сначала с большой скидкой',
         discountAsc: 'Сначала с меньшей скидкой',
         title: 'Сортировка'
      },
      productsTitle: 'Товары'
    },
    product: {
      sku: 'Артикул',
      inStock: 'В наличии',
      outOfStock: 'Нет в наличии',
      bundleIncludes: 'В этот комплект входит:',
      totalPrice: 'Общая стоимость:',
      characteristics: 'Характеристики',
      description: 'Описание',
      requestInfo: 'Запросить информацию',
      realPhotosDefault: 'Фото от наших покупателей'
    },
    consultation: {
      title: 'Консультация',
      quickAnswer: 'Нужен быстрый ответ?',
      writeToManager: 'Написать менеджеру',
      orLeaveRequest: 'Или оставьте заявку',
      nameLabel: 'Ваше имя',
      phoneLabel: 'Телефон',
      questionLabel: 'Ваш вопрос',
      namePlaceholder: 'Иван Иванов',
      questionPlaceholder: 'Опишите, что вас интересует...',
      submitButton: 'Отправить запрос',
      successTitle: 'Заявка принята!',
      successMessage: 'Мы свяжемся с вами в течение 24 часов для уточнения деталей.',
      backToCatalog: 'Вернуться в каталог'
    },
    favorites: {
      title: 'Избранное',
      empty: 'В избранном пока пусто'
    },
    nav: {
      catalog: 'Каталог',
      consultation: 'Консультация',
      favorites: 'Избранное'
    },
    admin: {
      panelTitle: 'Панель администратора',
      close: 'Закрыть',
      loginTitle: 'Вход',
      loginSubtitle: 'Введите номер администратора',
      loginButton: 'Войти',
      logout: 'Выход',
      toStore: 'В магазин',
      common: {
        on: 'ВКЛ',
        off: 'ВЫКЛ',
        select: '-- Выберите --',
        save: 'Сохранить',
        cancel: 'Отмена'
      },
      tabs: {
        products: 'Товары',
        categories: 'Категории',
        settings: 'Настройки',
        interface: 'Интерфейс',
        statistics: 'Статистика'
      },
      actions: {
        addProduct: '+ Товар',
        addCategory: '+ Категория',
        importCsv: 'Импорт CSV',
        exportCsv: 'Экспорт CSV',
        save: 'Сохранить',
        create: 'Создать',
        cancel: 'Закрыть',
        delete: 'Удалить',
        edit: 'Редактировать',
        resetDb: 'Сбросить базу (Демо)',
        deleteAll: 'Удалить ВСЕ товары',
        confirmDelete: 'Вы уверены?',
        deleteCategoryConfirm: 'Удалить категорию? Вложенные категории переместятся в корень.',
        deleteStickerConfirm: 'Удалить стикер?',
        resetDbConfirm: 'Вы уверены, что хотите сбросить базу данных до начальных демо-товаров? Все ваши изменения будут потеряны.',
        deleteAllConfirm: 'ВНИМАНИЕ: Это удалит ВСЕ товары из базы данных. Вы уверены?',
        restoreConfirm: 'ВНИМАНИЕ: Это действие полностью заменит текущую базу данных (товары, категории, настройки) данными из файла. Текущие данные будут потеряны. Продолжить?'
      },
      messages: {
        loginError: 'Неверный номер телефона',
        uploadImage: 'Пожалуйста, загрузите изображение.',
        backupDownloaded: 'Бэкап базы данных успешно скачан',
        backupError: 'Ошибка чтения файла бэкапа',
        restoreSuccess: 'База данных успешно восстановлена!',
        restoreError: 'Ошибка при восстановлении данных.',
        exportSuccess: 'Экспорт успешно завершен',
        productsProcessed: 'Обработано товаров:',
        readError: 'Не удалось прочитать товары',
        productDeleted: 'Товар удален',
        productUpdated: 'Товар обновлен',
        productAdded: 'Товар добавлен',
        photoRequired: 'Добавьте фото товара',
        categoryDeleted: 'Категория удалена',
        categoryOrderUpdated: 'Порядок категорий обновлен',
        categoryUpdated: 'Категория обновлена',
        categoryCreated: 'Категория создана',
        stickerCreated: 'Стикер создан',
        stickerDeleted: 'Стикер удален',
        settingsSaved: 'Настройки успешно сохранены!',
        saveFirst: 'Сначала сохраните товар, чтобы добавить его в варианты.'
      },
      products: {
        title: 'Товары',
        filterAll: 'Все категории',
        shown: 'Показано:',
        from: 'из',
        productsCountSuffix: 'товаров',
        notFound: 'Товары не найдены',
        editModalTitle: 'Редактировать товар',
        newModalTitle: 'Новый товар',
        typeRegular: 'Обычный товар',
        typeBundle: 'Комплект (Сет)',
        nameLabel: 'Название *',
        priceLabel: 'Цена *',
        specialPriceLabel: 'Акция',
        skuLabel: 'Артикул',
        stockLabel: 'Количество',
        locationLabel: 'Расположение товара',
        sectionLabel: 'Раздел (Родитель)',
        categoryLabel: 'Категория',
        allSections: '-- Все разделы --',
        rootSection: '-- В корень раздела --',
        stickersLabel: 'Стикеры',
        descriptionLabel: 'Описание',
        characteristicsLabel: 'Характеристики',
        addCharacteristic: '+ Добавить',
        attributeNamePlaceholder: 'Название',
        attributeValuePlaceholder: 'Значение',
        photosLabel: 'Фото (Drop/Paste)',
        dropText: 'Перетащите файл сюда',
        bundleComposition: 'Состав комплекта',
        bundleSearchPlaceholder: 'Найти товар для комплекта...',
        bundleTotal: 'Итого:',
        bundleEmpty: 'Добавьте товары в комплект',
        variantsTitle: 'Варианты товара',
        addVariantParam: '+ Параметр',
        relatedProducts: 'Связанные товары:',
        noVariants: 'Нет вариантов',
        addSelfToVariants: '+ Добавить этот товар в список',
        findProductToAdd: 'Найти товар для добавления...',
        variantParamLabel: 'Параметр',
        myValueLabel: 'Мой',
        preview: 'Предпросмотр',
        urlPlaceholder: 'URL доп. фото (через запятую)'
      },
      categories: {
        dragHint: 'Перетащите категорию, чтобы изменить порядок',
        editModalTitle: 'Редактировать категорию',
        newModalTitle: 'Новая категория',
        nameLabel: 'Название',
        sortOrderLabel: 'Порядок сортировки',
        parentLabel: 'Родительская категория',
        rootOption: '-- Корневая --',
        imageLabel: 'Изображение',
        dropText: 'Drop image here',
        showImage: 'Показывать фото',
        activeStatus: 'Активна'
      },
      settings: {
        storeName: 'Название магазина',
        description: 'Описание',
        managerContact: 'Контакты менеджера (ссылка)',
        logo: 'Логотип',
        saveButton: 'Сохранить настройки',
        backupTitle: 'Резервное копирование',
        downloadBackup: 'Скачать бэкап',
        restore: 'Восстановить',
        backupHint: 'Скачайте файл .json для сохранения данных. Чтобы восстановить, загрузите этот файл.',
      },
      interface: {
        displayTitle: 'Отображение',
        languageLabel: 'Язык интерфейса',
        languageHint: 'Переключить язык магазина и админки',
        showSkuLabel: 'Показывать артикулы',
        showSkuHint: 'Артикул будет виден в карточке',
        showSubcatLabel: 'Товары из подкатегорий',
        showSubcatHint: 'Показывать товары в родительской категории',
        realPhotosTitle: 'Живые фото (Галерея)',
        enableGallery: 'Включить блок',
        enableGalleryHint: 'Показывать блок с фото покупателей',
        blockTitleLabel: 'Заголовок блока',
        uploadPhotoLabel: 'Загрузить фото',
        dropText: 'Перетащите фото сюда',
        stickersTitle: 'Стикеры товаров',
        stickerName: 'Название',
        stickerColor: 'Цвет',
        saveInterfaceButton: 'Сохранить интерфейс',
      },
      statistics: {
        title: 'Статистика магазина',
        totalProducts: 'Всего товаров',
        totalCategories: 'Всего категорий',
        favoritesAdds: 'Добавлений в избранное',
        favoritesHint: 'Сколько раз товары добавляли в избранное',
        clientRequests: 'Заявок на консультацию',
        requestsHint: 'Нажатий на кнопку отправки формы',
        note: 'Статистика хранится локально в браузере.',
      },
      import: {
        title: 'Импорт товаров (CSV)',
        dropText: 'Перетащите CSV файл сюда',
        processing: 'Обработка...',
        close: 'Закрыть',
      }
    }
  },
  en: {
    start: {
      catalogButton: 'Go to Catalog',
      consultationButton: 'Request Consultation',
      adminButton: 'Admin Panel',
      adminLogin: 'Admin'
    },
    catalog: {
      title: 'Catalog',
      searchPlaceholder: 'Search...',
      nothingFound: 'Nothing found 😔',
      emptyCategory: 'No products in this category yet',
      sort: {
         default: 'Default',
         priceAsc: 'Price: Low to High',
         priceDesc: 'Price: High to Low',
         discountDesc: 'Biggest Discount',
         discountAsc: 'Smallest Discount',
         title: 'Sort by'
      },
      productsTitle: 'Products'
    },
    product: {
      sku: 'SKU',
      inStock: 'In Stock',
      outOfStock: 'Out of Stock',
      bundleIncludes: 'Bundle includes:',
      totalPrice: 'Total price:',
      characteristics: 'Specifications',
      description: 'Description',
      requestInfo: 'Request Info',
      realPhotosDefault: 'Customer Photos'
    },
    consultation: {
      title: 'Consultation',
      quickAnswer: 'Need a quick answer?',
      writeToManager: 'Contact Manager',
      orLeaveRequest: 'Or leave a request',
      nameLabel: 'Your Name',
      phoneLabel: 'Phone',
      questionLabel: 'Your Question',
      namePlaceholder: 'John Doe',
      questionPlaceholder: 'What are you interested in...',
      submitButton: 'Submit Request',
      successTitle: 'Request Sent!',
      successMessage: 'We will contact you within 24 hours.',
      backToCatalog: 'Back to Catalog'
    },
    favorites: {
      title: 'Favorites',
      empty: 'Favorites list is empty'
    },
    nav: {
      catalog: 'Catalog',
      consultation: 'Consultation',
      favorites: 'Favorites'
    },
    admin: {
      panelTitle: 'Admin Panel',
      close: 'Close',
      loginTitle: 'Login',
      loginSubtitle: 'Enter admin number',
      loginButton: 'Enter',
      logout: 'Logout',
      toStore: 'To Store',
      common: {
        on: 'ON',
        off: 'OFF',
        select: '-- Select --',
        save: 'Save',
        cancel: 'Cancel'
      },
      tabs: {
        products: 'Products',
        categories: 'Categories',
        settings: 'Settings',
        interface: 'Interface',
        statistics: 'Statistics'
      },
      actions: {
        addProduct: '+ Product',
        addCategory: '+ Category',
        importCsv: 'Import CSV',
        exportCsv: 'Export CSV',
        save: 'Save',
        create: 'Create',
        cancel: 'Close',
        delete: 'Delete',
        edit: 'Edit',
        resetDb: 'Reset DB (Demo)',
        deleteAll: 'Delete ALL Products',
        confirmDelete: 'Are you sure?',
        deleteCategoryConfirm: 'Delete category? Subcategories will move to root.',
        deleteStickerConfirm: 'Delete sticker?',
        resetDbConfirm: 'Are you sure you want to reset to demo data? All changes will be lost.',
        deleteAllConfirm: 'WARNING: This will delete ALL products. Are you sure?',
        restoreConfirm: 'WARNING: This will replace the current database with the backup file. Current data will be lost. Continue?'
      },
      messages: {
        loginError: 'Invalid phone number',
        uploadImage: 'Please upload an image.',
        backupDownloaded: 'Database backup downloaded successfully',
        backupError: 'Error reading backup file',
        restoreSuccess: 'Database restored successfully!',
        restoreError: 'Error restoring data.',
        exportSuccess: 'Export completed successfully',
        productsProcessed: 'Products processed:',
        readError: 'Failed to read products',
        productDeleted: 'Product deleted',
        productUpdated: 'Product updated',
        productAdded: 'Product added',
        photoRequired: 'Add a product photo',
        categoryDeleted: 'Category deleted',
        categoryOrderUpdated: 'Category order updated',
        categoryUpdated: 'Category updated',
        categoryCreated: 'Category created',
        stickerCreated: 'Sticker created',
        stickerDeleted: 'Sticker deleted',
        settingsSaved: 'Settings saved successfully!',
        saveFirst: 'Save product first to add it to variants.'
      },
      products: {
        title: 'Products',
        filterAll: 'All Categories',
        shown: 'Shown:',
        from: 'of',
        productsCountSuffix: 'products',
        notFound: 'No products found',
        editModalTitle: 'Edit Product',
        newModalTitle: 'New Product',
        typeRegular: 'Regular',
        typeBundle: 'Bundle (Set)',
        nameLabel: 'Name *',
        priceLabel: 'Price *',
        specialPriceLabel: 'Special Price',
        skuLabel: 'SKU',
        stockLabel: 'Stock',
        locationLabel: 'Product Location',
        sectionLabel: 'Section (Parent)',
        categoryLabel: 'Category',
        allSections: '-- All Sections --',
        rootSection: '-- In Root --',
        stickersLabel: 'Stickers',
        descriptionLabel: 'Description',
        characteristicsLabel: 'Characteristics',
        addCharacteristic: '+ Add',
        attributeNamePlaceholder: 'Name',
        attributeValuePlaceholder: 'Value',
        photosLabel: 'Photos (Drop/Paste)',
        dropText: 'Drop file here',
        bundleComposition: 'Bundle Composition',
        bundleSearchPlaceholder: 'Find product for bundle...',
        bundleTotal: 'Total:',
        bundleEmpty: 'Add products to bundle',
        variantsTitle: 'Variants',
        addVariantParam: '+ Parameter',
        relatedProducts: 'Related Products:',
        noVariants: 'No variants',
        addSelfToVariants: '+ Add this product to list',
        findProductToAdd: 'Find product to add...',
        variantParamLabel: 'Parameter',
        myValueLabel: 'My Value',
        preview: 'Preview',
        urlPlaceholder: 'URL add. photos (comma separated)'
      },
      categories: {
        dragHint: 'Drag category to reorder',
        editModalTitle: 'Edit Category',
        newModalTitle: 'New Category',
        nameLabel: 'Name',
        sortOrderLabel: 'Sort Order',
        parentLabel: 'Parent Category',
        rootOption: '-- Root --',
        imageLabel: 'Image',
        dropText: 'Drop image here',
        showImage: 'Show Image',
        activeStatus: 'Active'
      },
      settings: {
        storeName: 'Store Name',
        description: 'Description',
        managerContact: 'Manager Contact (Link)',
        logo: 'Logo',
        saveButton: 'Save Settings',
        backupTitle: 'Backup & Restore',
        downloadBackup: 'Download Backup',
        restore: 'Restore',
        backupHint: 'Download .json to save data. Upload to restore.',
      },
      interface: {
        displayTitle: 'Display',
        languageLabel: 'Interface Language',
        languageHint: 'Switch store and admin language',
        showSkuLabel: 'Show SKU',
        showSkuHint: 'SKU will be visible in card',
        showSubcatLabel: 'Products from Subcats',
        showSubcatHint: 'Show products in parent category',
        realPhotosTitle: 'Real Photos (Gallery)',
        enableGallery: 'Enable Block',
        enableGalleryHint: 'Show customer photos block',
        blockTitleLabel: 'Block Title',
        uploadPhotoLabel: 'Upload Photo',
        dropText: 'Drop photo here',
        stickersTitle: 'Product Stickers',
        stickerName: 'Name',
        stickerColor: 'Color',
        saveInterfaceButton: 'Save Interface',
      },
      statistics: {
        title: 'Store Statistics',
        totalProducts: 'Total Products',
        totalCategories: 'Total Categories',
        favoritesAdds: 'Favorites Adds',
        favoritesHint: 'Times added to favorites',
        clientRequests: 'Consultation Requests',
        requestsHint: 'Form submissions',
        note: 'Statistics are stored locally.',
      },
      import: {
        title: 'Import Products (CSV)',
        dropText: 'Drop CSV file here',
        processing: 'Processing...',
        close: 'Close',
      }
    }
  }
};
