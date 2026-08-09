const { Document, Packer, Paragraph, Heading, TextRun, AlignmentType } = require('docx');
const fs = require('fs');

const doc = new Document({
  sections: [{
    children: [
      new Paragraph({
        text: 'KHUDYAKOV.AGENCY — Все тексты сайта',
        heading: true,
        style: 'Heading1',
        spacing: { after: 400 },
        alignment: AlignmentType.CENTER,
      }),

      new Paragraph({
        text: 'Meta / SEO',
        style: 'Heading2',
        spacing: { before: 300, after: 150 },
      }),
      new Paragraph({ text: 'Title: KHUDYAKOV.AGENCY — видеопродакшн полного цикла', spacing: { after: 100 } }),
      new Paragraph({ 
        text: 'Description: Агентство видеопроизводства KHUDYAKOV.AGENCY: рекламные ролики, имиджевые видео, съёмка мероприятий и motion design. 5 лет на рынке, 450+ роликов, 200+ клиентов.',
        spacing: { after: 300 }
      }),

      new Paragraph({
        text: 'HERO',
        style: 'Heading2',
        spacing: { before: 300, after: 150 },
      }),
      new Paragraph({ text: 'H1: Видеопродакшн, который не пропускают', spacing: { after: 100 } }),
      new Paragraph({
        text: 'Подзаголовок: Пробиваемся через информационный шум, цепляем внимание и держим зрителя до конца — снимаем видео, которое повышает узнаваемость и запоминаемость бренда.',
        spacing: { after: 300 }
      }),

      new Paragraph({
        text: 'УСЛУГИ (9 пунктов)',
        style: 'Heading2',
        spacing: { before: 300, after: 150 },
      }),
      new Paragraph({ text: '1. Продвижение товаров и услуг — Рекламные ролики, которые доносят суть продукта и продают через эмоцию и точный посыл.', spacing: { after: 100 } }),
      new Paragraph({ text: '2. Наполнение социальных сетей — Регулярный видеоконтент для Instagram, Reels, YouTube и Telegram в стиле бренда.', spacing: { after: 100 } }),
      new Paragraph({ text: '3. Развитие личного бренда — Видео для экспертов и лидеров мнений — от интервью до имиджевых роликов.', spacing: { after: 100 } }),
      new Paragraph({ text: '4. 3D/2D графика — Анимация, инфографика и визуальные эффекты любой сложности — от заставки до VFX.', spacing: { after: 100 } }),
      new Paragraph({ text: '5. Специальные проекты — Нестандартные форматы под задачу клиента — от идеи и сценария до реализации.', spacing: { after: 100 } }),
      new Paragraph({ text: '6. Обучающие ролики — Видеоуроки и объясняющие ролики, которые понятно доносят сложные темы.', spacing: { after: 100 } }),
      new Paragraph({ text: '7. Музыкальные клипы — Полное производство клипа: концепция, съёмка, монтаж и цветокоррекция.', spacing: { after: 100 } }),
      new Paragraph({ text: '8. Продвижение мероприятия — Афтер-муви и промо-ролики конференций, презентаций и корпоративных событий.', spacing: { after: 100 } }),
      new Paragraph({ text: '9. Продвижение компании — Имиджевые и корпоративные фильмы, формирующие доверие к бренду.', spacing: { after: 300 } }),

      new Paragraph({
        text: 'ТАРИФЫ (3 уровня)',
        style: 'Heading2',
        spacing: { before: 300, after: 150 },
      }),
      new Paragraph({ text: 'Стартовый: от 35 000 до 75 000 ₽ — Видеопродукт базового уровня. Команда от 5 человек.', spacing: { after: 100 } }),
      new Paragraph({ text: 'Профессиональный: от 75 000 до 255 000 ₽ — Креативное видео на заказ. Команда от 10 человек.', spacing: { after: 100 } }),
      new Paragraph({ text: 'Премиальный: от 900 000 ₽ — Эксклюзивный видеоролик на заказ. Команда от 15 человек.', spacing: { after: 300 } }),

      new Paragraph({
        text: 'БРИФА (20 вопросов)',
        style: 'Heading2',
        spacing: { before: 300, after: 150 },
      }),
      new Paragraph({ text: 'H1: Съёмка начинается с брифа', spacing: { after: 100 } }),
      new Paragraph({ text: 'Текст: Ответьте на 20 вопросов о проекте — это займёт около пяти минут. В конце мы соберём всё в один документ, который останется только отправить нам на почту.', spacing: { after: 200 } }),

      new Paragraph({ text: 'СЦЕНА 1 · О ВАС', style: 'Heading3', spacing: { before: 150, after: 100 } }),
      new Paragraph({ text: 'Q1. Как называется ваш бренд?', spacing: { after: 80 } }),
      new Paragraph({ text: 'Q2. Чем занимается компания?', spacing: { after: 80 } }),
      new Paragraph({ text: 'Q3. Как вас зовут?', spacing: { after: 80 } }),
      new Paragraph({ text: 'Q4. Как с вами связаться?', spacing: { after: 200 } }),

      new Paragraph({ text: 'СЦЕНА 2 · ЦЕЛЬ', style: 'Heading3', spacing: { before: 150, after: 100 } }),
      new Paragraph({ text: 'Q5. Какой ролик нужен?', spacing: { after: 80 } }),
      new Paragraph({ text: 'Q6. Что должен сделать зритель после просмотра?', spacing: { after: 80 } }),
      new Paragraph({ text: 'Q7. Кто ваша аудитория?', spacing: { after: 80 } }),
      new Paragraph({ text: 'Q8. Где будет жить ролик?', spacing: { after: 200 } }),

      new Paragraph({ text: 'СЦЕНА 3 · ФОРМАТ', style: 'Heading3', spacing: { before: 150, after: 100 } }),
      new Paragraph({ text: 'Q9. Какой хронометраж нужен?', spacing: { after: 80 } }),
      new Paragraph({ text: 'Q10. Нужны версии под сторис и шортсы?', spacing: { after: 80 } }),
      new Paragraph({ text: 'Q11. Сценарий уже есть?', spacing: { after: 80 } }),
      new Paragraph({ text: 'Q12. Какая подача ближе?', spacing: { after: 200 } }),

      new Paragraph({ text: 'СЦЕНА 4 · СТИЛЬ', style: 'Heading3', spacing: { before: 150, after: 100 } }),
      new Paragraph({ text: 'Q13. Какое сообщение должно прозвучать?', spacing: { after: 80 } }),
      new Paragraph({ text: 'Q14. Есть ролики, которые нравятся по стилю?', spacing: { after: 80 } }),
      new Paragraph({ text: 'Q15. Чего точно нужно избежать?', spacing: { after: 80 } }),
      new Paragraph({ text: 'Q16. Есть фирменный стиль?', spacing: { after: 200 } }),

      new Paragraph({ text: 'СЦЕНА 5 · ЛОГИСТИКА', style: 'Heading3', spacing: { before: 150, after: 100 } }),
      new Paragraph({ text: 'Q17. Нужна съёмка или работаем с готовым материалом?', spacing: { after: 80 } }),
      new Paragraph({ text: 'Q18. Локация, актёры, дикторы?', spacing: { after: 80 } }),
      new Paragraph({ text: 'Q19. Какой бюджет закладываете?', spacing: { after: 80 } }),
      new Paragraph({ text: 'Q20. К какой дате нужен готовый ролик?', spacing: { after: 200 } }),

      new Paragraph({
        text: '———',
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 150 }
      }),
      new Paragraph({
        text: 'Документ готов к редактированию. Правьте смыслы и отправляйте обратно.',
        italics: true,
        alignment: AlignmentType.CENTER,
      }),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('content/site-copy.docx', buffer);
  console.log('✓ Документ создан: content/site-copy.docx');
});
