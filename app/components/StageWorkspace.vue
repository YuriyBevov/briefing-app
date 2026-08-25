<script setup lang="ts">
import type {
	BriefLink,
	BriefLinkStatus,
	Checklist,
	ChecklistItemStatus,
} from "~/composables/useProjectStore";

const props = defineProps<{
	sectionId: string;
}>();

const {
	acceptBriefLinkToWork,
	canUsePermission,
	createBriefClientLink,
	data,
	deleteBrief,
	deleteBriefLink,
	deleteChecklist,
	briefLinkStatusLabels,
	createBriefRevisionLink,
	getBriefsBySection,
	getChecklistsBySection,
	updateBriefLinkTitle,
	updateChecklistItemComment,
	updateChecklistItemStatus,
} = useProjectStore();
const { openEditModal } = useCreationModal();
const copiedLinkId = ref("");
const renamingBriefLink = ref<{
	briefId: string;
	briefTitle: string;
	link: BriefLink;
} | null>(null);
const briefLinkTitleForm = reactive({
	title: "",
});

const section = computed(() => data.value.sections.find((item) => item.id === props.sectionId));
const canViewSection = computed(() =>
	Boolean(section.value?.isActive) && canUsePermission(`view_section_${props.sectionId}`).value
);
const checklists = getChecklistsBySection(props.sectionId);
const briefs = getBriefsBySection(props.sectionId);
const getChecklistProgress = (checklist: Checklist) => {
	if (checklist.items.length === 0) {
		return 0;
	}

	const closedItems = checklist.items.filter((item) => item.status !== "pending");

	return Math.round((closedItems.length / checklist.items.length) * 100);
};

const getRequiredOpenCount = (checklist: Checklist) =>
	checklist.items.filter((item) => item.required && item.status === "pending").length;

const editChecklist = (id: string) => {
	openEditModal("checklist", id);
};

const removeChecklist = (id: string) => {
	deleteChecklist(id);
};

const changeChecklistItemStatus = (
	checklistId: string,
	itemId: string,
	status: ChecklistItemStatus,
) => {
	updateChecklistItemStatus(checklistId, itemId, status);
};

const toggleChecklistItemStatus = (
	checklistId: string,
	itemId: string,
	currentStatus: ChecklistItemStatus,
	nextStatus: ChecklistItemStatus,
) => {
	changeChecklistItemStatus(checklistId, itemId, currentStatus === nextStatus ? "pending" : nextStatus);
};

const updateChecklistCommentFromEvent = (checklistId: string, itemId: string, event: Event) => {
	const target = event.target as HTMLTextAreaElement;

	updateChecklistItemComment(checklistId, itemId, target.value);
};

const editBrief = (id: string) => {
	openEditModal("brief", id);
};

const removeBrief = (id: string) => {
	deleteBrief(id);
};

const createClientLink = (id: string) => {
	createBriefClientLink(id);
};

const getCompletedLinksCount = (links: Array<{ status: BriefLinkStatus }>) =>
	links.filter((link) =>
		link.status === "completed" ||
		link.status === "revision_completed" ||
		link.status === "in_work",
	).length;

const getPluralLabel = (count: number, forms: [string, string, string]) => {
	const absoluteCount = Math.abs(count);
	const lastTwoDigits = absoluteCount % 100;
	const lastDigit = absoluteCount % 10;

	if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
		return forms[2];
	}

	if (lastDigit === 1) {
		return forms[0];
	}

	if (lastDigit >= 2 && lastDigit <= 4) {
		return forms[1];
	}

	return forms[2];
};

const getBriefMeta = (links: Array<{ status: BriefLinkStatus }>, questionsCount: number) => {
	const questionLabel = getPluralLabel(questionsCount, ["вопрос", "вопроса", "вопросов"]);

	if (!links.length) {
		return `${questionsCount} ${questionLabel}`;
	}

	const linksCount = links.length;
	const completedLinksCount = getCompletedLinksCount(links);
	const linkLabel = getPluralLabel(linksCount, ["ссылка", "ссылки", "ссылок"]);
	const completedLabel = getPluralLabel(completedLinksCount, ["заполнена", "заполнены", "заполнено"]);

	return `${questionsCount} ${questionLabel} · ${linksCount} ${linkLabel} · ${completedLinksCount} ${completedLabel}`;
};

const getBriefLinkStatusLabel = (status: BriefLinkStatus) => briefLinkStatusLabels[status];

const getBriefLinkTitle = (link: BriefLink, briefTitle: string) => link.title || briefTitle;

const getBriefLinkHistories = (links: BriefLink[]) => {
	const histories: Array<{ id: string; links: BriefLink[] }> = [];

	links.forEach((link) => {
		const historyId = link.historyId ?? link.id;
		const history = histories.find((item) => item.id === historyId);

		if (history) {
			history.links.push(link);
			return;
		}

		histories.push({
			id: historyId,
			links: [link],
		});
	});

	return histories;
};

const getBriefLinkStatusClasses = (status: BriefLinkStatus) => ({
	"brief-card__link-status--pending": status === "pending",
	"brief-card__link-status--revision-pending": status === "revision_pending",
	"brief-card__link-status--completed": status === "completed" || status === "revision_completed",
	"brief-card__link-status--in-work": status === "in_work",
	"brief-card__link-status--archived": status === "archived",
});

const toggleBriefHistory = (event: MouseEvent) => {
	const details = (event.currentTarget as HTMLElement).closest("details");

	if (details) {
		details.open = !details.open;
	}
};

const openBriefForFilling = (briefId: string, linkId: string) => {
	createBriefRevisionLink(briefId, linkId);
};

const acceptBriefToWork = (briefId: string, linkId: string) => {
	acceptBriefLinkToWork(briefId, linkId);
};

const removeBriefLink = (briefId: string, linkId: string) => {
	deleteBriefLink(briefId, linkId);
};

const copyBriefLink = async (link: BriefLink) => {
	const url = getBriefLink(link.token);

	if (import.meta.client && navigator.clipboard) {
		await navigator.clipboard.writeText(url);
		copiedLinkId.value = link.id;
		window.setTimeout(() => {
			if (copiedLinkId.value === link.id) {
				copiedLinkId.value = "";
			}
		}, 1600);
	}
};

const openRenameBriefLinkModal = (briefId: string, briefTitle: string, link: BriefLink) => {
	renamingBriefLink.value = {
		briefId,
		briefTitle,
		link,
	};
	briefLinkTitleForm.title = link.title || briefTitle;
};

const closeRenameBriefLinkModal = () => {
	renamingBriefLink.value = null;
	briefLinkTitleForm.title = "";
};

const submitBriefLinkTitle = () => {
	if (!renamingBriefLink.value) {
		return;
	}

	updateBriefLinkTitle(
		renamingBriefLink.value.briefId,
		renamingBriefLink.value.link.id,
		briefLinkTitleForm.title,
	);
	closeRenameBriefLinkModal();
};

const getBriefLink = (token: string) => {
	if (import.meta.client) {
		return `${window.location.origin}/brief/${token}`;
	}

	return `/brief/${token}`;
};

</script>

<template>
	<section v-if="canViewSection" class="stage-page">
		<div class="section-header stage-page__header">
			<h1 class="page-title">{{ section?.title }}</h1>
		</div>

		<div class="stage-page__workspace">
			<section class="workspace-panel">
				<div class="section-header">
					<h2 class="section-title">Чеклисты</h2>
				</div>

				<div v-if="checklists.length" class="checklist-list">
					<details
						v-for="checklist in checklists"
						:key="checklist.id"
						class="checklist-card"
					>
						<summary class="checklist-card__header">
							<span class="checklist-card__summary">
								<span class="checklist-card__title">{{ checklist.title }}</span>
								<span class="checklist-card__meta">
									{{ getChecklistProgress(checklist) }}% ·
									{{ getRequiredOpenCount(checklist) }} обязательных пунктов
								</span>
							</span>
							<BaseIcon class="checklist-card__toggle-icon" name="chevron-down" />
						</summary>

						<div class="button-row checklist-card__actions">
							<button class="button button--secondary" type="button" @click="editChecklist(checklist.id)">
								Редактировать
							</button>
							<button class="button button--danger" type="button" @click="removeChecklist(checklist.id)">
								Удалить
							</button>
						</div>

						<ul class="checklist-card__list">
							<li
								v-for="item in checklist.items"
								:key="item.id"
								class="checklist-card__item"
								:class="{
									'checklist-card__item--completed': item.status === 'completed',
									'checklist-card__item--skipped': item.status === 'skipped',
								}"
							>
								<span
									class="checklist-card__item-text"
									:class="{ 'checklist-card__item-text--required': item.required }"
								>
									{{ item.text }}{{ item.required ? '*' : '' }}
								</span>
								<div class="checklist-card__item-controls">
									<ChecklistStatusCheckbox
										:checked="item.status === 'completed'"
										label="Выполнено"
										tone="success"
										@change="
											toggleChecklistItemStatus(
												checklist.id,
												item.id,
												item.status,
												'completed',
											)
										"
									/>

									<ChecklistStatusCheckbox
										:checked="item.status === 'skipped'"
										label="Не используется"
										tone="danger"
										@change="
											toggleChecklistItemStatus(
												checklist.id,
												item.id,
												item.status,
												'skipped',
											)
										"
									/>
								</div>
								<label class="field checklist-card__comment">
									<span class="field__label">Комментарий</span>
									<textarea
										class="field__control"
										:value="item.comment"
										:disabled="item.status !== 'pending'"
										@input="updateChecklistCommentFromEvent(checklist.id, item.id, $event)"
									/>
								</label>
							</li>
						</ul>
					</details>
				</div>

				<p v-else class="card-description">Создать чеклист</p>
			</section>

			<section class="workspace-panel">
				<div class="section-header">
					<h2 class="section-title">Брифы</h2>
				</div>

				<div v-if="briefs.length" class="brief-list">
					<details v-for="brief in briefs" :key="brief.id" class="brief-card">
						<summary class="brief-card__header">
							<span class="brief-card__body">
								<span class="brief-card__title">{{ brief.title }}</span>
								<span class="brief-card__meta">
									{{ getBriefMeta(brief.links, brief.questions.length) }}
								</span>
							</span>
							<BaseIcon class="brief-card__toggle-icon" name="chevron-down" />
						</summary>

						<div class="button-row brief-card__actions">
							<button class="button button--secondary" type="button" @click="editBrief(brief.id)">
								Редактировать
							</button>
							<button
								class="button button--secondary"
								type="button"
								@click="createClientLink(brief.id)"
							>
								Создать ссылку
							</button>
							<button class="button button--danger" type="button" @click="removeBrief(brief.id)">
								Удалить
							</button>
						</div>

						<div v-if="brief.links.length" class="brief-card__links">
							<details
								v-for="history in getBriefLinkHistories(brief.links)"
								:key="history.id"
								class="brief-card__link-item"
							>
								<summary class="brief-card__link-summary">
									<div class="brief-card__link-node brief-card__link-node--current">
										<div
											v-if="history.links[0]"
											class="brief-card__link-header"
										>
											<span class="brief-card__link-main">
												<span class="brief-card__link-tools">
													<button
														class="button button--secondary button--small brief-card__icon-button"
														type="button"
														aria-label="Копировать ссылку"
														:title="copiedLinkId === history.links[0].id ? 'Скопировано' : 'Копировать ссылку'"
														@click.stop="copyBriefLink(history.links[0])"
													>
														<BaseIcon class="brief-card__copy-icon" name="copy" />
													</button>
													<button
														class="button button--secondary button--small brief-card__icon-button"
														type="button"
														aria-label="Изменить название"
														title="Изменить название"
														@click.stop="openRenameBriefLinkModal(brief.id, brief.title, history.links[0])"
													>
														<BaseIcon class="brief-card__edit-icon" name="edit" />
													</button>
												</span>
												<span class="brief-card__link-content">
													<a
														class="brief-card__link"
														:href="getBriefLink(history.links[0].token)"
														target="_blank"
														@click.stop
													>
														{{ getBriefLinkTitle(history.links[0], brief.title) }}
													</a>
													<span class="brief-card__link-url">
														{{ getBriefLink(history.links[0].token) }}
													</span>
												</span>
											</span>
											<span
												class="brief-card__link-status"
												:class="getBriefLinkStatusClasses(history.links[0].status)"
											>
												{{ getBriefLinkStatusLabel(history.links[0].status) }}
											</span>
											<button
												class="button button--secondary button--small brief-card__icon-button brief-card__history-toggle"
												type="button"
												:disabled="history.links.length <= 1"
												aria-label="Свернуть историю"
												title="История экземпляра"
												@click.stop.prevent="toggleBriefHistory"
											>
												<BaseIcon class="brief-card__link-toggle-icon" name="chevron-down" />
											</button>
										</div>

										<div
											v-if="history.links[0] && history.links[0].status !== 'archived'"
											class="button-row brief-card__link-actions"
										>
											<button
												class="button button--danger button--small"
												type="button"
												:disabled="
													history.links[0].status === 'pending' ||
													history.links[0].status === 'revision_pending' ||
													history.links[0].status === 'archived'
												"
												@click.stop="openBriefForFilling(brief.id, history.links[0].id)"
											>
												Открыть бриф к заполнению
											</button>
											<button
												class="button button--primary button--small"
												type="button"
												:disabled="
													history.links[0].status !== 'completed' &&
													history.links[0].status !== 'revision_completed'
												"
												@click.stop="acceptBriefToWork(brief.id, history.links[0].id)"
											>
												Принять в работу
											</button>
											<button
												class="button button--secondary button--small"
												type="button"
												@click.stop="removeBriefLink(brief.id, history.links[0].id)"
											>
												Удалить
											</button>
										</div>
									</div>
								</summary>

								<div
									v-if="history.links.length > 1"
									class="brief-card__link-tree"
								>
									<div
										v-for="link in history.links.slice(1)"
										:key="link.id"
										class="brief-card__link-node"
									>
										<div class="brief-card__link-header">
											<span class="brief-card__link-content">
												<a
													class="brief-card__link"
													:href="getBriefLink(link.token)"
													target="_blank"
												>
													{{ getBriefLink(link.token) }}
												</a>
											</span>
											<span
												class="brief-card__link-status"
												:class="getBriefLinkStatusClasses(link.status)"
											>
												{{ getBriefLinkStatusLabel(link.status) }}
											</span>
										</div>
									</div>
								</div>
							</details>
						</div>
					</details>
				</div>

				<p v-else class="card-description">Создать бриф</p>
			</section>
		</div>
	</section>

	<section v-else class="stage-page">
		<div class="section-header stage-page__header">
			<h1 class="page-title">{{ section?.title ?? "Раздел" }}</h1>
		</div>

		<section class="workspace-panel">
			<p class="card-description">Раздел отключён или у вас нет прав на его просмотр.</p>
		</section>
	</section>

	<SettingsModal
		v-if="renamingBriefLink"
		title="Изменить название ссылки"
		@close="closeRenameBriefLinkModal"
	>
		<form class="settings-form" @submit.prevent="submitBriefLinkTitle">
			<label class="field">
				<span class="field__label">Название</span>
				<input
					v-model="briefLinkTitleForm.title"
					class="field__control"
					type="text"
					:placeholder="renamingBriefLink.briefTitle"
					autofocus
				/>
			</label>

			<div class="button-row">
				<button class="button button--primary" type="submit">
					Сохранить
				</button>
				<button class="button button--secondary" type="button" @click="closeRenameBriefLinkModal">
					Отменить
				</button>
			</div>
		</form>
	</SettingsModal>
</template>
