<script setup lang="ts">
const { canUsePermission } = useProjectStore()
const canViewUiComponents = canUsePermission('view_ui_components')

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
  { name: 'ColorWarning', token: '--color-warning' },
  { name: 'ColorControl', token: '--color-control' }
]

const spacingTokens = [
  { name: 'SpaceXs', token: '--space-xs' },
  { name: 'SpaceSm', token: '--space-sm' },
  { name: 'SpaceMd', token: '--space-md' },
  { name: 'SpaceLg', token: '--space-lg' },
  { name: 'SpaceXl', token: '--space-xl' }
]

const iconNames = [
  'check',
  'copy',
  'edit',
  'chevron-down',
  'close',
  'drag-handle',
  'history',
  'lock',
  'logout',
  'maximize',
  'menu',
  'message',
  'moon',
  'note',
  'panel',
  'plus',
  'send',
  'settings',
  'sun',
  'unlock',
  'trash'
] as const

const fieldSelectOptions = [
  { value: 'approval', label: 'Согласование' },
  { value: 'design', label: 'Дизайн' },
  { value: 'development', label: 'Разработка' }
]

const baseSelectValue = ref('design')
const placeholderSelectValue = ref('')
const disabledSelectValue = ref('approval')
const baseMultiSelectValue = ref(['approval', 'design'])
const emptyMultiSelectValue = ref<string[]>([])
const defaultCheckboxValue = ref(true)
const successCheckboxValue = ref(true)
const dangerCheckboxValue = ref(true)
const defaultRadioValue = ref('default')
const toneRadioValue = ref('success')

const tableRows = [
  { component: 'BriefLinkItemCompleted', status: 'Согласован', owner: 'Менеджер' },
  { component: 'ChecklistItemRequired', status: 'Ожидает', owner: 'Дизайнер' },
  { component: 'ButtonPrimary', status: 'Готов', owner: 'Система' }
]
</script>

<template>
  <section v-if="canViewUiComponents" class="ui-page">
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
          <span class="section-title">Иконки</span>
          <span class="ui-accordion__meta">BaseIcon</span>
        </summary>
        <div class="ui-accordion__body">
          <div class="ui-grid ui-grid--icons">
            <div v-for="iconName in iconNames" :key="iconName" class="ui-icon-sample">
              <BaseIcon class="ui-icon-sample__icon" :name="iconName" />
              <span class="ui-name">Icon{{ iconName }}</span>
              <code class="ui-code">name="{{ iconName }}"</code>
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
            <div class="ui-sample">
              <span class="ui-name">AppFooterLogo</span>
              <AppFooterLogo />
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
              <span class="ui-name">ButtonDangerSmall</span>
              <button class="button button--danger button--small" type="button">Удалить</button>
            </div>
            <div class="ui-sample">
              <span class="ui-name">ButtonSecondaryHover</span>
              <button class="button button--secondary ui-force-hover" type="button">Редактировать</button>
            </div>
            <div class="ui-sample">
              <span class="ui-name">BaseDisclosureToggle</span>
              <BaseDisclosureToggle label="Развернуть блок" />
            </div>
            <div class="ui-sample">
              <span class="ui-name">BaseDisclosureToggleOpen</span>
              <BaseDisclosureToggle expanded label="Свернуть блок" />
            </div>
            <div class="ui-sample">
              <span class="ui-name">BaseDisclosureToggleDisabled</span>
              <BaseDisclosureToggle disabled label="Развернуть блок" />
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
                <span class="brief-card__link-title">Бриф на дизайн</span>
                <span class="brief-card__link-url">http://localhost:3000/brief/example</span>
              </a>
            </div>
            <div class="ui-sample">
              <span class="ui-name">ThemeToggle</span>
              <button class="theme-toggle" type="button" aria-label="ThemeToggle">
                <BaseIcon class="theme-toggle__icon" name="moon" />
              </button>
            </div>
          </div>
        </div>
      </details>

      <details class="ui-accordion">
        <summary class="ui-accordion__summary">
          <span class="section-title">Выпадающие списки</span>
          <span class="ui-accordion__meta">SelectControls</span>
        </summary>
        <div class="ui-accordion__body">
          <div class="ui-grid">
            <div class="ui-sample">
              <span class="ui-name">BaseSelectDefault</span>
              <BaseSelect v-model="baseSelectValue" :options="fieldSelectOptions" />
              <code class="ui-code">BaseSelect v-model options</code>
            </div>
            <div class="ui-sample">
              <span class="ui-name">BaseSelectPlaceholder</span>
              <BaseSelect
                v-model="placeholderSelectValue"
                :options="fieldSelectOptions"
                placeholder="Выберите раздел"
              />
              <code class="ui-code">placeholder="Выберите раздел"</code>
            </div>
            <div class="ui-sample">
              <span class="ui-name">BaseSelectDisabled</span>
              <BaseSelect v-model="disabledSelectValue" :options="fieldSelectOptions" disabled />
              <code class="ui-code">disabled</code>
            </div>
            <div class="ui-sample">
              <span class="ui-name">BaseMultiSelectDefault</span>
              <BaseMultiSelect v-model="baseMultiSelectValue" :options="fieldSelectOptions" />
              <code class="ui-code">BaseMultiSelect v-model options</code>
            </div>
            <div class="ui-sample">
              <span class="ui-name">BaseMultiSelectPlaceholder</span>
              <BaseMultiSelect
                v-model="emptyMultiSelectValue"
                :options="fieldSelectOptions"
                placeholder="Выберите разделы"
              />
              <code class="ui-code">placeholder="Выберите разделы"</code>
            </div>
            <div class="ui-sample">
              <span class="ui-name">ProjectSwitcherCombobox</span>
              <ProjectSwitcher />
              <code class="ui-code">Combobox с поиском</code>
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
            <div class="field">
              <span class="field__label">FieldSelect</span>
              <BaseSelect model-value="design" :options="fieldSelectOptions" />
            </div>
            <label class="field">
              <span class="field__label">FieldTextarea</span>
              <textarea class="field__control">Комментарий к пункту чеклиста</textarea>
            </label>
            <label class="field">
              <span class="field__label">FieldDisabled</span>
              <input class="field__control" type="text" value="Поле закрыто" disabled />
            </label>
            <div class="ui-sample">
              <span class="ui-name">BaseRadioDefault</span>
              <div class="choice-list">
                <BaseRadio v-model="defaultRadioValue" name="ui-radio-default" value="default" label="По умолчанию" />
                <BaseRadio v-model="defaultRadioValue" name="ui-radio-default" value="disabled" label="Неактивно" disabled />
              </div>
            </div>
            <div class="ui-sample">
              <span class="ui-name">BaseRadioTones</span>
              <div class="choice-list">
                <BaseRadio v-model="toneRadioValue" name="ui-radio-tone" value="success" label="Success" tone="success" />
                <BaseRadio v-model="toneRadioValue" name="ui-radio-tone" value="danger" label="Danger" tone="danger" />
              </div>
            </div>
            <div class="ui-sample">
              <span class="ui-name">BaseCheckboxDefault</span>
              <div class="choice-list">
                <BaseCheckbox v-model="defaultCheckboxValue" label="По умолчанию" />
                <BaseCheckbox :model-value="false" label="Неактивно" disabled />
              </div>
            </div>
            <div class="ui-sample">
              <span class="ui-name">BaseCheckboxTones</span>
              <div class="choice-list">
                <BaseCheckbox v-model="successCheckboxValue" label="Success" tone="success" />
                <BaseCheckbox v-model="dangerCheckboxValue" label="Danger" tone="danger" />
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
              <div class="label label--pending">Ожидает заполнения</div>
            </div>
            <div class="ui-sample">
              <span class="ui-name">BriefLinkStatusCompleted</span>
              <div class="label label--completed">Согласован</div>
            </div>
            <div class="ui-sample">
              <span class="ui-name">BriefLinkStatusRevisionPending</span>
              <div class="label label--revision-pending">
                Ожидает редакции
              </div>
            </div>
            <div class="ui-sample">
              <span class="ui-name">BriefLinkStatusRevisionCompleted</span>
              <div class="label label--completed">
                Отредактирован и согласован
              </div>
            </div>
            <div class="ui-sample">
              <span class="ui-name">BriefLinkStatusInWork</span>
              <div class="label label--in-work">В работе</div>
            </div>
            <div class="ui-sample">
              <span class="ui-name">BriefLinkStatusArchived</span>
              <div class="label label--archived">Архив</div>
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
          <details class="workspace-card checklist-card">
            <summary class="workspace-card__header">
              <span class="workspace-card__summary">
                <span class="ui-name">ChecklistCardCollapsed</span>
                <span class="workspace-card__title">Чеклист предподготовки</span>
                <span class="workspace-card__meta">0% · 2 обязательных пунктов</span>
              </span>
              <BaseDisclosureToggle class="workspace-card__toggle" label="Развернуть чеклист" />
            </summary>
          </details>
          <details class="workspace-card checklist-card" open>
            <summary class="workspace-card__header">
              <span class="workspace-card__summary">
                <span class="ui-name">ChecklistCardOpen</span>
                <span class="workspace-card__title">Чеклист запуска</span>
                <span class="workspace-card__meta">66% · 1 обязательных пунктов</span>
              </span>
              <BaseDisclosureToggle class="workspace-card__toggle" expanded label="Свернуть чеклист" />
            </summary>
            <div class="workspace-card__actions">
              <BaseActionMenu label="Действия чеклиста">
                <button class="action-menu__item" type="button">
                  <BaseIcon class="action-menu__icon" name="edit" />
                  <span>Изменить</span>
                </button>
                <button class="action-menu__item action-menu__item--danger" type="button">
                  <BaseIcon class="action-menu__icon" name="trash" />
                  <span>Удалить</span>
                </button>
              </BaseActionMenu>
            </div>
            <ul class="checklist-card__list">
              <li class="checklist-card__item">
                <span class="ui-name">ChecklistItemPending</span>
                <span class="checklist-card__item-text">Подготовить структуру вопросов</span>
                <div class="checklist-card__item-controls">
                  <BaseCheckbox :checked="false" label="Выполнено" tone="success" hide-label />
                  <BaseCheckbox :checked="false" label="Не используется" tone="danger" hide-label />
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
                  <BaseCheckbox :checked="true" label="Выполнено" tone="success" hide-label />
                  <BaseCheckbox :checked="false" label="Не используется" tone="danger" hide-label />
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
                  <BaseCheckbox :checked="false" label="Выполнено" tone="success" hide-label />
                  <BaseCheckbox :checked="true" label="Не используется" tone="danger" hide-label />
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
          <div class="workspace-block__content">
            <details class="workspace-card brief-card">
              <summary class="workspace-card__header">
                <span class="workspace-card__summary">
                  <span class="ui-name">BriefCardCollapsed</span>
                  <span class="workspace-card__title">Бриф на аудит интерфейса</span>
                  <span class="workspace-card__meta">6 вопросов</span>
                </span>
                <BaseDisclosureToggle class="workspace-card__toggle" label="Развернуть бриф" />
              </summary>
            </details>
            <details class="workspace-card workspace-card--empty brief-card">
              <summary class="workspace-card__header">
                <span class="workspace-card__summary">
                  <span class="ui-name">BriefCardEmpty</span>
                  <span class="workspace-card__title">Бриф без ссылок</span>
                  <span class="workspace-card__meta">4 вопроса</span>
                </span>
                <BaseDisclosureToggle class="workspace-card__toggle" disabled label="Развернуть бриф" />
              </summary>
            </details>
            <details class="workspace-card brief-card" open>
              <summary class="workspace-card__header">
                <span class="workspace-card__summary">
                  <span class="ui-name">BriefCardOpen</span>
                  <span class="workspace-card__title">Бриф на дизайн главной страницы</span>
                  <span class="workspace-card__meta">4 вопроса · 2 ссылки · 1 заполнена</span>
                </span>
                <BaseDisclosureToggle class="workspace-card__toggle" expanded label="Свернуть бриф" />
              </summary>
              <div class="workspace-card__actions">
                <BaseActionMenu label="Действия брифа">
                  <button class="action-menu__item" type="button">
                    <BaseIcon class="action-menu__icon" name="edit" />
                    <span>Изменить</span>
                  </button>
                  <button class="action-menu__item" type="button">
                    <BaseIcon class="action-menu__icon" name="plus" />
                    <span>Создать ссылку</span>
                  </button>
                  <button class="action-menu__item action-menu__item--danger" type="button">
                    <BaseIcon class="action-menu__icon" name="trash" />
                    <span>Удалить</span>
                  </button>
                </BaseActionMenu>
              </div>
              <div class="brief-card__links">
                <details class="brief-card__link-item" open>
                  <summary class="brief-card__link-summary">
                    <div class="brief-card__link-node brief-card__link-node--current">
                      <span class="ui-name">BriefLinkHistoryItemRevisionOpen</span>
                      <div class="brief-card__link-header">
                        <span class="brief-card__link-main">
                          <a class="brief-card__link" href="/brief/example-revision-pending" target="_blank">
                            <span class="brief-card__link-title">Главная страница, редакция клиента</span>
                            <span class="brief-card__link-url">http://localhost:3000/brief/example-revision-pending</span>
                          </a>
                        </span>
                        <div class="label label--revision-pending">Ожидает редакции</div>
                        <span class="brief-card__link-controls">
                          <BaseActionMenu label="Действия ссылки на бриф">
                            <button class="action-menu__item" type="button">
                              <BaseIcon class="action-menu__icon" name="copy" />
                              <span>Копировать</span>
                            </button>
                            <button class="action-menu__item" type="button">
                              <BaseIcon class="action-menu__icon" name="edit" />
                              <span>Редактировать</span>
                            </button>
                            <button class="action-menu__item" type="button" disabled>
                              <BaseIcon class="action-menu__icon" name="unlock" />
                              <span>Создать ссылку</span>
                            </button>
                            <button class="action-menu__item" type="button" disabled>
                              <BaseIcon class="action-menu__icon" name="check" />
                              <span>Принять в работу</span>
                            </button>
                            <button class="action-menu__item action-menu__item--danger" type="button">
                              <BaseIcon class="action-menu__icon" name="trash" />
                              <span>Удалить</span>
                            </button>
                          </BaseActionMenu>
                          <BaseDisclosureToggle class="brief-card__history-toggle" expanded label="История экземпляра" />
                        </span>
                      </div>
                    </div>
                  </summary>
                  <div class="brief-card__link-tree">
                    <div class="brief-card__link-node">
                      <span class="ui-name">BriefLinkHistoryNodeArchived</span>
                      <div class="brief-card__link-header">
                        <a class="brief-card__link" href="/brief/example-archived" target="_blank">
                          <span class="brief-card__link-title">
                            http://localhost:3000/brief/example-archived
                          </span>
                        </a>
                        <div class="label label--archived">Архив</div>
                      </div>
                    </div>
                  </div>
                </details>
                <details class="brief-card__link-item">
                  <summary class="brief-card__link-summary">
                    <div class="brief-card__link-node brief-card__link-node--current">
                      <span class="ui-name">BriefLinkHistoryItemCollapsed</span>
                      <div class="brief-card__link-header">
                        <span class="brief-card__link-main">
                          <a class="brief-card__link" href="/brief/example-completed" target="_blank">
                            <span class="brief-card__link-title">Бриф на дизайн главной страницы</span>
                            <span class="brief-card__link-url">http://localhost:3000/brief/example-completed</span>
                          </a>
                        </span>
                        <div class="label label--completed">Согласован</div>
                        <span class="brief-card__link-controls">
                          <BaseActionMenu label="Действия ссылки на бриф">
                            <button class="action-menu__item" type="button">
                              <BaseIcon class="action-menu__icon" name="copy" />
                              <span>Копировать</span>
                            </button>
                            <button class="action-menu__item" type="button">
                              <BaseIcon class="action-menu__icon" name="edit" />
                              <span>Редактировать</span>
                            </button>
                            <button class="action-menu__item" type="button">
                              <BaseIcon class="action-menu__icon" name="unlock" />
                              <span>Создать ссылку</span>
                            </button>
                            <button class="action-menu__item" type="button">
                              <BaseIcon class="action-menu__icon" name="check" />
                              <span>Принять в работу</span>
                            </button>
                            <button class="action-menu__item action-menu__item--danger" type="button">
                              <BaseIcon class="action-menu__icon" name="trash" />
                              <span>Удалить</span>
                            </button>
                          </BaseActionMenu>
                          <BaseDisclosureToggle class="brief-card__history-toggle" disabled label="История экземпляра" />
                        </span>
                      </div>
                    </div>
                  </summary>
                </details>
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
            </div>
            <aside class="sidebar ui-sidebar-preview">
              <div class="sidebar__top">
                <a class="logo" href="/">Логотип</a>
              </div>
              <div class="sidebar__content">
                <div class="sidebar__project">
                  <ProjectSwitcher />
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
              </div>
              <div class="sidebar__footer">
                <div class="user-menu">
                  <span class="user-menu__avatar">ЮБ</span>
                  <span class="user-menu__body">
                    <span class="user-menu__name">Юрий Б.</span>
                    <span class="user-menu__role">Менеджер</span>
                  </span>
                </div>
                <button class="theme-toggle" type="button" aria-label="ThemeToggle">
                  <BaseIcon class="theme-toggle__icon" name="moon" />
                </button>
              </div>
            </aside>
            <BaseWorkspaceBlock
              title="Чеклисты"
              create-label="Создать"
              create-icon="plus"
              :collapsed="false"
            >
              <span class="ui-name">BaseWorkspaceBlock</span>
              <div class="workspace-block__content">
                <details class="workspace-card checklist-card">
                  <summary class="workspace-card__header">
                    <button class="workspace-card__drag" type="button" aria-label="Перетащить" title="Перетащить">
                      <BaseIcon class="workspace-card__drag-icon" name="drag-handle" />
                    </button>
                    <span class="workspace-card__summary">
                      <span class="workspace-card__title">Проверить материалы</span>
                      <span class="workspace-card__meta">0% · 2 обязательных пункта</span>
                    </span>
                    <BaseDisclosureToggle class="workspace-card__toggle" label="Развернуть чеклист" />
                  </summary>
                </details>
              </div>
            </BaseWorkspaceBlock>
            <BaseWorkspaceBlock
              title="Пустой блок"
              create-label="Создать"
              :collapsed="true"
              toggle-disabled
            >
              <span class="ui-name">BaseWorkspaceBlockEmpty</span>
            </BaseWorkspaceBlock>
            <div class="workspace-block">
              <span class="ui-name">WorkspaceBlock</span>
              <div class="section-header">
                <h2 class="section-title">Чеклисты</h2>
                <button class="button button--secondary" type="button">Создать</button>
              </div>
            </div>
            <div class="side-rail side-rail--demo side-rail--open">
              <span class="ui-name">SideRailRightSidebar</span>
              <div class="side-rail__rail">
                <header class="side-rail__header">
                  <time class="side-rail__time">14:30</time>
                </header>

                <nav class="side-rail__actions" aria-label="Быстрые панели проекта">
                  <div class="side-rail__action-group">
                    <button class="side-rail__rail-action side-rail__rail-action--active" type="button" aria-label="Чат проекта" title="Чат проекта">
                      <BaseIcon class="side-rail__rail-icon" name="message" />
                    </button>
                    <button class="side-rail__rail-action" type="button" disabled aria-label="Заметки" title="Заметки">
                      <BaseIcon class="side-rail__rail-icon" name="note" />
                    </button>
                    <button class="side-rail__rail-action" type="button" disabled aria-label="История изменений" title="История изменений">
                      <BaseIcon class="side-rail__rail-icon" name="history" />
                    </button>
                  </div>

                  <div class="side-rail__action-group side-rail__action-group--utility">
                    <a class="side-rail__rail-action" href="/settings" aria-label="Настройки" title="Настройки">
                      <BaseIcon class="side-rail__rail-icon" name="settings" />
                    </a>
                    <a class="side-rail__rail-action" href="/ui-components" aria-label="UI-компоненты" title="UI-компоненты">
                      <BaseIcon class="side-rail__rail-icon" name="panel" />
                    </a>
                  </div>
                </nav>

                <footer class="side-rail__footer">
                  <button class="button button--secondary side-rail__system-action" type="button" aria-label="Выйти" title="Выйти">
                    <BaseIcon class="side-rail__system-icon" name="logout" />
                  </button>
                </footer>
              </div>
              <section class="side-rail__drawer" aria-label="Чат проекта">
                <header class="side-rail__drawer-header">
                  <h2 class="section-title">Чат проекта</h2>
                  <BaseIconButton label="Скрыть чат проекта" icon="close" />
                </header>
                <ProjectFeedBlock class="side-rail__chat" :framed="false" form-position="bottom" :has-items="true">
                  <template #form>
                    <form class="side-rail__form">
                      <label class="side-rail__composer">
                        <textarea
                          class="field__control side-rail__input"
                          rows="1"
                          aria-label="Сообщение"
                          value="Текст сообщения"
                        />
                        <button class="button button--small side-rail__send" type="button" aria-label="Отправить" title="Отправить">
                          <BaseIcon class="side-rail__send-icon" name="send" />
                        </button>
                      </label>
                    </form>
                  </template>

                  <ProjectFeedCard
                    author="Администратор"
                    date="26.08.2026, 12:30"
                    text="Добавлено сообщение по проекту."
                    actions-mode="context"
                    readonly
                  />
                </ProjectFeedBlock>
              </section>
            </div>
          </div>
        </div>
      </details>

      <details class="ui-accordion">
        <summary class="ui-accordion__summary">
          <span class="section-title">Модальные окна</span>
          <span class="ui-accordion__meta">BaseModal</span>
        </summary>
        <div class="ui-accordion__body">
          <div class="modal__panel ui-modal-preview">
            <div class="section-header modal__header">
              <h2 class="section-title">ModalHeader</h2>
              <BaseModalCloseButton />
            </div>

            <div class="modal__body">
              <form class="modal-form">
                <label class="field">
                  <span class="field__label">ModalTitleField</span>
                  <input class="field__control" type="text" value="Бриф клиента" />
                </label>
                <div class="modal-form__group">
                  <span class="modal-form__group-title">ModalFormGroup</span>
                  <div class="modal-form__row">
                    <label class="field">
                      <span class="field__label">ModalFormRowField</span>
                      <input class="field__control" type="text" value="Вопрос" />
                    </label>
                    <button class="button button--danger" type="button">Удалить</button>
                  </div>
                </div>
              </form>
            </div>

            <div class="modal__footer">
              <button class="button button--primary" type="button">Создать</button>
            </div>
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
                <span class="public-brief__description">Описание для клиента.</span>
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

  <section v-else class="stage-page">
    <div class="section-header stage-page__header">
      <h1 class="page-title">UI-компоненты</h1>
    </div>

    <section class="workspace-block">
      <p class="card-description">У вас нет прав на просмотр этого раздела.</p>
    </section>
  </section>
</template>
