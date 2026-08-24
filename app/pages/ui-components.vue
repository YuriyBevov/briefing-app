<script setup lang="ts">
const colorTokens = [
  { name: 'ColorBackground', token: '--color-background' },
  { name: 'ColorSurface', token: '--color-surface' },
  { name: 'ColorSurfaceMuted', token: '--color-surface-muted' },
  { name: 'ColorText', token: '--color-text' },
  { name: 'ColorTextMuted', token: '--color-text-muted' },
  { name: 'ColorBorder', token: '--color-border' },
  { name: 'ColorAccent', token: '--color-accent' },
  { name: 'ColorAccentStrong', token: '--color-accent-strong' },
  { name: 'ColorAccentSoft', token: '--color-accent-soft' },
  { name: 'ColorDanger', token: '--color-danger' },
  { name: 'ColorSuccess', token: '--color-success' },
  { name: 'ColorControl', token: '--color-control' }
]

const spacingTokens = [
  { name: 'SpaceXs', token: '--space-xs' },
  { name: 'SpaceSm', token: '--space-sm' },
  { name: 'SpaceMd', token: '--space-md' },
  { name: 'SpaceLg', token: '--space-lg' },
  { name: 'SpaceXl', token: '--space-xl' }
]

const tableRows = [
  { component: 'BriefLinkItemCompleted', status: 'Заполнен', owner: 'Менеджер' },
  { component: 'ChecklistItemRequired', status: 'Ожидает', owner: 'Дизайнер' },
  { component: 'ButtonPrimary', status: 'Готов', owner: 'Система' }
]
</script>

<template>
  <section class="ui-page">
    <div class="section-header ui-page__header">
      <div>
        <h1 class="page-title">UI-компоненты</h1>
        <p class="ui-page__lead">Компоненты сгруппированы по назначению. Каждый пример имеет уникальное имя.</p>
      </div>
    </div>

    <div class="ui-accordion-list">
      <details class="ui-accordion" open>
        <summary class="ui-accordion__summary">
          <span class="section-title">Токены</span>
          <span class="ui-accordion__meta">DesignTokens</span>
        </summary>
        <div class="ui-accordion__body">
          <div class="ui-grid ui-grid--tokens">
            <div v-for="color in colorTokens" :key="color.name" class="ui-token">
              <span
                class="ui-token__swatch"
                :style="{ backgroundColor: `var(${color.token})` }"
                aria-hidden="true"
              />
              <span class="ui-name">{{ color.name }}</span>
              <code class="ui-code">{{ color.token }}</code>
            </div>
          </div>

          <div class="ui-spacing-list">
            <div v-for="space in spacingTokens" :key="space.name" class="ui-spacing">
              <span class="ui-name">{{ space.name }}</span>
              <span class="ui-spacing__bar" :style="{ width: `var(${space.token})` }" aria-hidden="true" />
              <code class="ui-code">{{ space.token }}</code>
            </div>
          </div>
        </div>
      </details>

      <details class="ui-accordion">
        <summary class="ui-accordion__summary">
          <span class="section-title">Типографика</span>
          <span class="ui-accordion__meta">Typography</span>
        </summary>
        <div class="ui-accordion__body">
          <div class="ui-grid">
            <div class="ui-sample">
              <span class="ui-name">PageTitle</span>
              <h1 class="page-title">Согласование</h1>
            </div>
            <div class="ui-sample">
              <span class="ui-name">SectionTitle</span>
              <h2 class="section-title">Брифы</h2>
            </div>
            <div class="ui-sample">
              <span class="ui-name">CardDescription</span>
              <p class="card-description">Создать чеклист</p>
            </div>
            <div class="ui-sample">
              <span class="ui-name">Logo</span>
              <a class="logo" href="/">Логотип</a>
            </div>
          </div>
        </div>
      </details>

      <details class="ui-accordion">
        <summary class="ui-accordion__summary">
          <span class="section-title">Кнопки</span>
          <span class="ui-accordion__meta">Buttons</span>
        </summary>
        <div class="ui-accordion__body">
          <div class="ui-sample-row">
            <div class="ui-sample">
              <span class="ui-name">ButtonPrimary</span>
              <button class="button button--primary" type="button">Сохранить</button>
            </div>
            <div class="ui-sample">
              <span class="ui-name">ButtonPrimaryHover</span>
              <button class="button button--primary ui-force-hover" type="button">Сохранить</button>
            </div>
            <div class="ui-sample">
              <span class="ui-name">ButtonPrimaryDisabled</span>
              <button class="button button--primary" type="button" disabled>Согласовать</button>
            </div>
            <div class="ui-sample">
              <span class="ui-name">ButtonSecondary</span>
              <button class="button button--secondary" type="button">Редактировать</button>
            </div>
            <div class="ui-sample">
              <span class="ui-name">ButtonSecondaryHover</span>
              <button class="button button--secondary ui-force-hover" type="button">Редактировать</button>
            </div>
            <div class="ui-sample">
              <span class="ui-name">ButtonRowMixed</span>
              <div class="button-row">
                <button class="button button--secondary" type="button">Отмена</button>
                <button class="button button--primary" type="button">Готово</button>
              </div>
            </div>
          </div>
        </div>
      </details>

      <details class="ui-accordion">
        <summary class="ui-accordion__summary">
          <span class="section-title">Ссылки и навигация</span>
          <span class="ui-accordion__meta">LinksNavigation</span>
        </summary>
        <div class="ui-accordion__body">
          <div class="ui-grid">
            <div class="ui-sample">
              <span class="ui-name">SidebarLinkDefault</span>
              <a class="sidebar__link" href="/design">Дизайн</a>
            </div>
            <div class="ui-sample">
              <span class="ui-name">SidebarLinkActive</span>
              <a class="sidebar__link router-link-active" href="/">Согласование</a>
            </div>
            <div class="ui-sample">
              <span class="ui-name">BriefCardLink</span>
              <a class="brief-card__link" href="/brief/example" target="_blank">
                http://localhost:3000/brief/example
              </a>
            </div>
            <div class="ui-sample">
              <span class="ui-name">ThemeToggle</span>
              <button class="theme-toggle" type="button">Светлая тема</button>
            </div>
          </div>
        </div>
      </details>

      <details class="ui-accordion">
        <summary class="ui-accordion__summary">
          <span class="section-title">Поля форм</span>
          <span class="ui-accordion__meta">FormControls</span>
        </summary>
        <div class="ui-accordion__body">
          <div class="ui-grid">
            <label class="field">
              <span class="field__label">FieldText</span>
              <input class="field__control" type="text" value="Название брифа" />
            </label>
            <label class="field">
              <span class="field__label">FieldSelect</span>
              <select class="field__control">
                <option>Согласование</option>
                <option selected>Дизайн</option>
                <option>Разработка</option>
              </select>
            </label>
            <label class="field">
              <span class="field__label">FieldTextarea</span>
              <textarea class="field__control">Комментарий к пункту чеклиста</textarea>
            </label>
            <label class="field">
              <span class="field__label">FieldDisabled</span>
              <input class="field__control" type="text" value="Поле закрыто" disabled />
            </label>
            <label class="project-switcher">
              <span class="project-switcher__label">ProjectSwitcher</span>
              <select class="project-switcher__control">
                <option>Проект Alpha</option>
                <option>Проект Beta</option>
              </select>
            </label>
            <div class="ui-sample">
              <span class="ui-name">ChoiceRadioList</span>
              <div class="choice-list">
                <label class="switch-field">
                  <input class="switch-field__control" type="radio" name="ui-radio" checked />
                  <span class="switch-field__label">Да</span>
                </label>
                <label class="switch-field">
                  <input class="switch-field__control" type="radio" name="ui-radio" />
                  <span class="switch-field__label">Нет</span>
                </label>
              </div>
            </div>
            <div class="ui-sample">
              <span class="ui-name">ChoiceCheckboxList</span>
              <div class="choice-list">
                <label class="switch-field">
                  <input class="switch-field__control" type="checkbox" checked />
                  <span class="switch-field__label">Вариант A</span>
                </label>
                <label class="switch-field">
                  <input class="switch-field__control" type="checkbox" />
                  <span class="switch-field__label">Вариант B</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </details>

      <details class="ui-accordion">
        <summary class="ui-accordion__summary">
          <span class="section-title">Статусы</span>
          <span class="ui-accordion__meta">StatusBadges</span>
        </summary>
        <div class="ui-accordion__body">
          <div class="ui-sample-row">
            <div class="ui-sample">
              <span class="ui-name">BriefLinkStatusPending</span>
              <span class="brief-card__link-status">Ожидает заполнения</span>
            </div>
            <div class="ui-sample">
              <span class="ui-name">BriefLinkStatusCompleted</span>
              <span class="brief-card__link-status brief-card__link-status--completed">Заполнен</span>
            </div>
            <div class="ui-sample">
              <span class="ui-name">BriefLinkStatusApproved</span>
              <span class="brief-card__link-status brief-card__link-status--approved">Согласован</span>
            </div>
            <div class="ui-sample">
              <span class="ui-name">TopbarStatus</span>
              <span class="topbar__status">Активен</span>
            </div>
          </div>
        </div>
      </details>

      <details class="ui-accordion">
        <summary class="ui-accordion__summary">
          <span class="section-title">Чеклисты</span>
          <span class="ui-accordion__meta">ChecklistComponents</span>
        </summary>
        <div class="ui-accordion__body">
          <details class="checklist-card" open>
            <summary class="checklist-card__header">
              <span class="checklist-card__summary">
                <span class="ui-name">ChecklistCardOpen</span>
                <span class="checklist-card__title">Чеклист запуска</span>
                <span class="checklist-card__meta">66% · 1 обязательных пунктов</span>
              </span>
            </summary>
            <div class="button-row checklist-card__actions">
              <button class="button button--secondary" type="button">Редактировать</button>
              <button class="button button--secondary" type="button">Удалить</button>
            </div>
            <ul class="checklist-card__list">
              <li class="checklist-card__item">
                <span class="ui-name">ChecklistItemPending</span>
                <span class="checklist-card__item-text">Подготовить структуру вопросов</span>
                <div class="checklist-card__item-controls">
                  <ChecklistStatusCheckbox :checked="false" label="Выполнено" tone="success" />
                  <ChecklistStatusCheckbox :checked="false" label="Не используется" tone="danger" />
                </div>
                <label class="field checklist-card__comment">
                  <span class="field__label">ChecklistCommentActive</span>
                  <textarea class="field__control">Комментарий доступен</textarea>
                </label>
              </li>
              <li class="checklist-card__item checklist-card__item--completed">
                <span class="ui-name">ChecklistItemCompleted</span>
                <span class="checklist-card__item-text checklist-card__item-text--required">Согласовать прототип*</span>
                <div class="checklist-card__item-controls">
                  <ChecklistStatusCheckbox :checked="true" label="Выполнено" tone="success" />
                  <ChecklistStatusCheckbox :checked="false" label="Не используется" tone="danger" />
                </div>
                <label class="field checklist-card__comment">
                  <span class="field__label">ChecklistCommentDisabled</span>
                  <textarea class="field__control" disabled>Комментарий закрыт</textarea>
                </label>
              </li>
              <li class="checklist-card__item checklist-card__item--skipped">
                <span class="ui-name">ChecklistItemSkipped</span>
                <span class="checklist-card__item-text">Подключить необязательную интеграцию</span>
                <div class="checklist-card__item-controls">
                  <ChecklistStatusCheckbox :checked="false" label="Выполнено" tone="success" />
                  <ChecklistStatusCheckbox :checked="true" label="Не используется" tone="danger" />
                </div>
                <label class="field checklist-card__comment">
                  <span class="field__label">ChecklistCommentDisabledDanger</span>
                  <textarea class="field__control" disabled>Комментарий закрыт</textarea>
                </label>
              </li>
            </ul>
          </details>
        </div>
      </details>

      <details class="ui-accordion">
        <summary class="ui-accordion__summary">
          <span class="section-title">Брифы</span>
          <span class="ui-accordion__meta">BriefComponents</span>
        </summary>
        <div class="ui-accordion__body">
          <div class="brief-list">
            <details class="brief-card" open>
              <summary class="brief-card__header">
                <span class="brief-card__body">
                  <span class="ui-name">BriefCardOpen</span>
                  <span class="brief-card__title">Бриф на дизайн главной страницы</span>
                  <span class="brief-card__meta">4 вопросов · 2 ссылок · 1 заполнено</span>
                </span>
                <svg
                  class="brief-card__toggle-icon"
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M6 8L10 12L14 8"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </summary>
              <div class="button-row brief-card__actions">
                <button class="button button--secondary" type="button">Редактировать</button>
                <button class="button button--secondary" type="button">Создать ссылку</button>
                <button class="button button--secondary" type="button">Удалить</button>
              </div>
              <div class="brief-card__links">
                <div class="brief-card__link-item">
                  <span class="ui-name">BriefLinkItemPending</span>
                  <a class="brief-card__link" href="/brief/example-pending" target="_blank">
                    http://localhost:3000/brief/example-pending
                  </a>
                  <span class="brief-card__link-status">Ожидает заполнения</span>
                </div>
                <div class="brief-card__link-item">
                  <span class="ui-name">BriefLinkItemCompleted</span>
                  <a class="brief-card__link" href="/brief/example-completed" target="_blank">
                    http://localhost:3000/brief/example-completed
                  </a>
                  <span class="brief-card__link-status brief-card__link-status--completed">Заполнен</span>
                  <div class="button-row brief-card__link-actions">
                    <button class="button button--secondary" type="button">Открыть бриф к заполнению</button>
                    <button class="button button--primary" type="button">Согласован</button>
                    <button class="button button--secondary" type="button">Удалить</button>
                  </div>
                </div>
                <div class="brief-card__link-item">
                  <span class="ui-name">BriefLinkItemApproved</span>
                  <a class="brief-card__link" href="/brief/example-approved" target="_blank">
                    http://localhost:3000/brief/example-approved
                  </a>
                  <span class="brief-card__link-status brief-card__link-status--approved">Согласован</span>
                </div>
              </div>
            </details>
          </div>
        </div>
      </details>

      <details class="ui-accordion">
        <summary class="ui-accordion__summary">
          <span class="section-title">Каркас приложения</span>
          <span class="ui-accordion__meta">LayoutShell</span>
        </summary>
        <div class="ui-accordion__body">
          <div class="ui-stack">
            <div class="topbar ui-framed">
              <div class="topbar__project">
                <span class="ui-name">TopbarProject</span>
                <span class="topbar__title">Проект Alpha</span>
              </div>
              <div class="topbar__actions">
                <time class="topbar__time">12:40</time>
                <button class="button button--secondary" type="button">Выйти</button>
              </div>
            </div>
            <aside class="sidebar ui-sidebar-preview">
              <div class="sidebar__top">
                <a class="logo" href="/">Логотип</a>
                <label class="project-switcher">
                  <span class="project-switcher__label">ProjectSwitcher</span>
                  <select class="project-switcher__control">
                    <option>Проект Alpha</option>
                  </select>
                </label>
              </div>
              <nav class="sidebar__nav" aria-label="Демо меню">
                <ul class="sidebar__list">
                  <li class="sidebar__item">
                    <a class="sidebar__link router-link-active" href="/">Согласование</a>
                  </li>
                  <li class="sidebar__item">
                    <a class="sidebar__link" href="/design">Дизайн</a>
                  </li>
                </ul>
              </nav>
              <div class="sidebar__footer">
                <button class="theme-toggle" type="button">Светлая тема</button>
                <div class="user-menu">
                  <span class="user-menu__avatar">ЮБ</span>
                  <span class="user-menu__body">
                    <span class="user-menu__name">Юрий Б.</span>
                    <span class="user-menu__role">Менеджер</span>
                  </span>
                </div>
              </div>
            </aside>
            <div class="workspace-panel">
              <span class="ui-name">WorkspacePanel</span>
              <div class="section-header">
                <h2 class="section-title">Чеклисты</h2>
                <button class="button button--secondary" type="button">Создать</button>
              </div>
            </div>
            <div class="comments-panel">
              <span class="ui-name">CommentsPanel</span>
              <div class="section-header">
                <h2 class="section-title">Комментарии</h2>
              </div>
            </div>
          </div>
        </div>
      </details>

      <details class="ui-accordion">
        <summary class="ui-accordion__summary">
          <span class="section-title">Модальные окна</span>
          <span class="ui-accordion__meta">CreationModal</span>
        </summary>
        <div class="ui-accordion__body">
          <div class="creation-modal__panel ui-modal-preview">
            <form class="creation-form">
              <div class="section-header">
                <h2 class="section-title">CreationModalPanel</h2>
                <button class="button button--secondary" type="button">Закрыть</button>
              </div>
              <label class="field">
                <span class="field__label">CreationModalTitleField</span>
                <input class="field__control" type="text" value="Бриф клиента" />
              </label>
              <div class="creation-form__group">
                <span class="creation-form__group-title">CreationFormGroup</span>
                <div class="creation-form__row">
                  <label class="field">
                    <span class="field__label">CreationFormRowField</span>
                    <input class="field__control" type="text" value="Вопрос" />
                  </label>
                  <button class="button button--secondary" type="button">Удалить</button>
                </div>
              </div>
              <button class="button button--primary" type="button">Создать</button>
            </form>
          </div>
        </div>
      </details>

      <details class="ui-accordion">
        <summary class="ui-accordion__summary">
          <span class="section-title">Публичный бриф</span>
          <span class="ui-accordion__meta">PublicBrief</span>
        </summary>
        <div class="ui-accordion__body">
          <div class="public-brief ui-public-brief-preview">
            <div class="section-header">
              <h1 class="page-title">PublicBriefShell</h1>
            </div>
            <div class="public-brief__form">
              <div class="public-brief__question">
                <span class="ui-name">PublicBriefQuestionText</span>
                <span class="public-brief__question-title">Какая цель страницы?</span>
                <span class="public-brief__description">Пояснение для клиента.</span>
                <label class="field">
                  <span class="field__label">Ответ</span>
                  <input class="field__control" type="text" value="Получить заявки" />
                </label>
              </div>
              <div class="public-brief__question">
                <span class="ui-name">PublicBriefReadonlyAnswer</span>
                <span class="public-brief__question-title">Какие материалы готовы?</span>
                <span class="public-brief__answer">Логотип, тексты, фотографии</span>
              </div>
            </div>
          </div>
        </div>
      </details>

      <details class="ui-accordion">
        <summary class="ui-accordion__summary">
          <span class="section-title">Таблицы</span>
          <span class="ui-accordion__meta">DataTable</span>
        </summary>
        <div class="ui-accordion__body">
          <div class="ui-table-wrap">
            <table class="ui-table">
              <thead>
                <tr>
                  <th>ComponentName</th>
                  <th>StatusBadge</th>
                  <th>OwnerCell</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in tableRows" :key="row.component">
                  <td>{{ row.component }}</td>
                  <td>{{ row.status }}</td>
                  <td>{{ row.owner }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </details>
    </div>
  </section>
</template>
