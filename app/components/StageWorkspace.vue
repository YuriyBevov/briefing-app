<script setup lang="ts">
import type { BriefStatus, Checklist, ChecklistItemStatus, ProjectStage } from "~/composables/useProjectStore";

const props = defineProps<{
	title: ProjectStage;
}>();

const actions = ["Закрыть этап"];
const {
	briefStatusLabels,
	createBriefClientLink,
	deleteBrief,
	deleteChecklist,
	getBriefsByStage,
	getChecklistsByStage,
	updateChecklistItemStatus,
} = useProjectStore();
const { openEditModal } = useCreationModal();

const checklists = getChecklistsByStage(props.title);
const briefs = getBriefsByStage(props.title);
const checklistItemStatuses: Array<{ title: string; value: ChecklistItemStatus }> = [
	{ title: "Не начато", value: "pending" },
	{ title: "Выполнено", value: "completed" },
	{ title: "Не используется", value: "skipped" },
];

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

const changeChecklistItemStatusFromEvent = (checklistId: string, itemId: string, event: Event) => {
	const target = event.target as HTMLSelectElement;

	changeChecklistItemStatus(checklistId, itemId, target.value as ChecklistItemStatus);
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

const getBriefStatusLabel = (status: BriefStatus) => briefStatusLabels[status];

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
							<li v-for="item in checklist.items" :key="item.id" class="checklist-card__item">
								<span class="checklist-card__item-text">{{ item.text }}</span>
								<span class="checklist-card__item-status">
									{{ item.required ? "Обязательный" : "Необязательный" }}
								</span>
								<label class="field checklist-card__field">
									<span class="field__label">Статус</span>
									<select
										class="field__control"
										:value="item.status"
										@change="changeChecklistItemStatusFromEvent(checklist.id, item.id, $event)"
									>
										<option
											v-for="status in checklistItemStatuses"
											:key="status.value"
											:value="status.value"
										>
											{{ status.title }}
										</option>
									</select>
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
									{{ getBriefStatusLabel(brief.status) }} · {{ brief.questions.length }} вопросов
								</span>
								<span v-if="brief.status === 'completed'" class="brief-card__ready">Бриф заполнен</span>
							</span>
						</summary>

						<div class="button-row brief-card__actions">
							<button class="button button--secondary" type="button" @click="editBrief(brief.id)">
								Редактировать
							</button>
							<button
								class="button button--secondary"
								type="button"
								:disabled="brief.status === 'completed'"
								@click="createClientLink(brief.id)"
							>
								Создать ссылку
							</button>
							<button class="button button--secondary" type="button" @click="removeBrief(brief.id)">
								Удалить
							</button>
						</div>

						<div v-if="brief.links.length" class="brief-card__links">
							<a
								v-for="link in brief.links"
								:key="link.id"
								class="brief-card__link"
								:href="getBriefLink(link.token)"
								target="_blank"
							>
								{{ getBriefLink(link.token) }}
							</a>
						</div>

						<ul class="brief-card__list">
							<li v-for="question in brief.questions" :key="question.id" class="brief-card__item">
								<span class="brief-card__question">{{ question.text }}</span>
								<span class="brief-card__meta">
									{{ question.type }} · {{ question.required ? "Обязательный" : "Необязательный" }}
								</span>
								<span v-if="question.description" class="brief-card__description">
									{{ question.description }}
								</span>
								<span v-if="question.options.length" class="brief-card__description">
									{{ question.options.join(", ") }}
								</span>
							</li>
						</ul>
					</details>
				</div>

				<p v-else class="card-description">Создать бриф</p>
			</section>
		</div>
	</section>
</template>
