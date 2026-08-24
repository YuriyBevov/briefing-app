<script setup lang="ts">
import type {
	BriefLink,
	BriefLinkStatus,
	Checklist,
	ChecklistItemStatus,
	ProjectStage,
} from "~/composables/useProjectStore";

const props = defineProps<{
	title: ProjectStage;
}>();

const actions = ["Закрыть этап"];
const {
	acceptBriefLinkToWork,
	createBriefClientLink,
	deleteBrief,
	deleteBriefLink,
	deleteChecklist,
	briefLinkStatusLabels,
	createBriefRevisionLink,
	getBriefsByStage,
	getChecklistsByStage,
	updateBriefLinkTitle,
	updateChecklistItemComment,
	updateChecklistItemStatus,
} = useProjectStore();
const { openEditModal } = useCreationModal();
const copiedLinkId = ref("");

const checklists = getChecklistsByStage(props.title);
const briefs = getBriefsByStage(props.title);
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

const getBriefMeta = (links: Array<{ status: BriefLinkStatus }>, questionsCount: number) => {
	if (!links.length) {
		return `${questionsCount} вопросов`;
	}

	return `${questionsCount} вопросов · ${links.length} ссылок · ${getCompletedLinksCount(links)} заполнено`;
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

const renameBriefLink = (briefId: string, briefTitle: string, link: BriefLink) => {
	if (!import.meta.client) {
		return;
	}

	const title = window.prompt("Название экземпляра брифа", link.title || briefTitle);

	if (title === null) {
		return;
	}

	updateBriefLinkTitle(briefId, link.id, title);
};

const getBriefLink = (token: string) => {
	if (import.meta.client) {
		return `${window.location.origin}/brief/${token}`;
	}

	return `/brief/${token}`;
};

</script>

<template>
	<section class="stage-page">
		<div class="section-header stage-page__header">
			<h1 class="page-title">{{ title }}</h1>
			<div class="button-row stage-page__actions">
				<button
					v-for="action in actions"
					:key="action"
					class="button button--primary"
					type="button"
				>
					{{ action }}
				</button>
			</div>
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
						open
					>
						<summary class="checklist-card__header">
							<span class="checklist-card__summary">
								<span class="checklist-card__title">{{ checklist.title }}</span>
								<span class="checklist-card__meta">
									{{ getChecklistProgress(checklist) }}% ·
									{{ getRequiredOpenCount(checklist) }} обязательных пунктов
								</span>
							</span>
						</summary>

						<div class="button-row checklist-card__actions">
							<button class="button button--secondary" type="button" @click="editChecklist(checklist.id)">
								Редактировать
							</button>
							<button class="button button--secondary" type="button" @click="removeChecklist(checklist.id)">
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
					<details v-for="brief in briefs" :key="brief.id" class="brief-card" open>
						<summary class="brief-card__header">
							<span class="brief-card__body">
								<span class="brief-card__title">{{ brief.title }}</span>
								<span class="brief-card__meta">
									{{ getBriefMeta(brief.links, brief.questions.length) }}
								</span>
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
							<button class="button button--secondary" type="button" @click="removeBrief(brief.id)">
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
														<svg
															class="brief-card__copy-icon"
															viewBox="0 0 20 20"
															fill="none"
															aria-hidden="true"
														>
															<path
																d="M7 7V4.5C7 3.67 7.67 3 8.5 3H15.5C16.33 3 17 3.67 17 4.5V11.5C17 12.33 16.33 13 15.5 13H13M4.5 7H11.5C12.33 7 13 7.67 13 8.5V15.5C13 16.33 12.33 17 11.5 17H4.5C3.67 17 3 16.33 3 15.5V8.5C3 7.67 3.67 7 4.5 7Z"
																stroke="currentColor"
																stroke-width="1.7"
																stroke-linecap="round"
																stroke-linejoin="round"
															/>
														</svg>
													</button>
													<button
														class="button button--secondary button--small brief-card__icon-button"
														type="button"
														aria-label="Изменить название"
														title="Изменить название"
														@click.stop="renameBriefLink(brief.id, brief.title, history.links[0])"
													>
														<svg
															class="brief-card__edit-icon"
															viewBox="0 0 20 20"
															fill="none"
															aria-hidden="true"
														>
															<path
																d="M4 14.5V17H6.5L15.15 8.35L12.65 5.85L4 14.5Z"
																stroke="currentColor"
																stroke-width="1.7"
																stroke-linecap="round"
																stroke-linejoin="round"
															/>
															<path
																d="M11.75 6.75L13.25 5.25C13.94 4.56 15.06 4.56 15.75 5.25C16.44 5.94 16.44 7.06 15.75 7.75L14.25 9.25"
																stroke="currentColor"
																stroke-width="1.7"
																stroke-linecap="round"
																stroke-linejoin="round"
															/>
														</svg>
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
											<svg
												v-if="history.links.length > 1"
												class="brief-card__link-toggle-icon"
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
										</div>

										<div
											v-if="history.links[0] && history.links[0].status !== 'archived'"
											class="button-row brief-card__link-actions"
										>
											<button
												class="button button--secondary button--small"
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
													{{ getBriefLinkTitle(link, brief.title) }}
												</a>
												<span class="brief-card__link-url">
													{{ getBriefLink(link.token) }}
												</span>
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
</template>
