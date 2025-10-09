# API Тестирование

## Запуск тестов

### Локально

```bash
npm run test:smoke      # Smoke тесты
npm run test:regression # Regression тесты
```

### Docker (параллельно)

```bash
npm run docker:build    # Сборка образов
npm run docker:all      # Запуск всех тестов в 2 контейнерах
```

### Прямой Docker Compose

```bash
docker-compose up                    # Все тесты
docker-compose up smoke-tests        # Только smoke
docker-compose up regression-tests   # Только regression

# С кастомными параметрами
PROJECT=smoke WORKERS=2 docker-compose up smoke-tests
PROJECT=regression WORKERS=8 docker-compose up regression-tests
```

## GitHub Actions

### Docker Workflow

- **smoke-tests** - запуск smoke тестов в Docker
- **regression-tests** - запуск regression тестов в Docker
- **parallel-tests** - запуск всех тестов параллельно в Docker
- **generate-report** - генерация Allure отчета из всех результатов
- **publish-report** - публикация отчета на GitHub Pages

### Обычный Workflow

- **test** - запуск тестов локально
- **generate-report** - генерация отчета
- **publish-report** - публикация отчета

## Структура

- `tests/smoke/` - быстрые тесты основной функциональности (3 теста)
- `tests/regression/` - расширенные тесты всей функциональности (5 тестов)
- Каждый контейнер использует 4 потока для параллельного выполнения
- Гибкая настройка через переменные окружения `PROJECT` и `WORKERS`
