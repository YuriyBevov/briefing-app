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
	updateChecklistItemComment,
	updateChecklistItemStatus,
} = useProjectStore();
const { openEditModal } = useCreationModal();

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

const openBriefForFilling = (briefId: string, linkId: string) => {
	createBriefRevisionLink(briefId, linkId);
};

const acceptBriefToWork = (briefId: string, linkId: string) => {
	acceptBriefLinkToWork(briefId, linkId);
};

const removeBriefLink = (briefId: string, linkId: string) => {
	deleteBriefLink(briefId, linkId);
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
							<div
								v-for="history in getBriefLinkHistories(brief.links)"
								:key="history.id"
								class="brief-card__link-item"
							>
								<div class="brief-card__link-tree">
									<div
										v-for="link in history.links"
										:key="link.id"
										class="brief-card__link-node"
									>
										<div class="brief-card__link-header">
											<a
												class="brief-card__link"
												:href="getBriefLink(link.token)"
												target="_blank"
											>
												{{ getBriefLink(link.token) }}
											</a>
											<span
												class="brief-card__link-status"
												:class="{
													'brief-card__link-status--pending': link.status === 'pending',
													'brief-card__link-status--revision-pending': link.status === 'revision_pending',
													'brief-card__link-status--completed':
														link.status === 'completed' || link.status === 'revision_completed',
													'brief-card__link-status--in-work': link.status === 'in_work',
													'brief-card__link-status--archived': link.status === 'archived',
												}"
											>
												{{ getBriefLinkStatusLabel(link.status) }}
											</span>
										</div>

										<div
											v-if="link.status !== 'archived'"
											class="button-row brief-card__link-actions"
										>
											<button
												class="button button--secondary button--small"
												type="button"
												:disabled="
													link.status === 'pending' ||
													link.status === 'revision_pending' ||
													link.status === 'archived'
												"
												@click="openBriefForFilling(brief.id, link.id)"
											>
												Открыть бриф к заполнению
											</button>
											<button
												class="button button--primary button--small"
												type="button"
												:disabled="link.status !== 'completed' && link.status !== 'revision_completed'"
												@click="acceptBriefToWork(brief.id, link.id)"
											>
												Принять в работу
											</button>
											<button
												class="button button--secondary button--small"
												type="button"
												@click="removeBriefLink(brief.id, link.id)"
											>
												Удалить
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</details>
				</div>

				<p v-else class="card-description">Создать бриф</p>
			</section>
		</div>
	</section>
</template>
