<script setup lang="ts">
import type {
	BriefAnswerValue,
	BriefStatus,
	Checklist,
	ChecklistItemStatus,
	ProjectStage,
} from "~/composables/useProjectStore";

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

const getBriefStatusLabel = (status: BriefStatus) => briefStatusLabels[status];

const getBriefLink = (token: string) => {
	if (import.meta.client) {
		return `${window.location.origin}/brief/${token}`;
	}

	return `/brief/${token}`;
};

const formatBriefAnswer = (answer: BriefAnswerValue | undefined) => {
	if (Array.isArray(answer)) {
		return answer.length ? answer.join(", ") : "Нет ответа";
	}

	return answer || "Нет ответа";
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
								<span class="checklist-card__item-text">{{ item.text }}</span>
								<span class="checklist-card__item-status">
									{{ item.required ? "Обязательный" : "Необязательный" }}
								</span>
								<div class="checklist-card__item-controls">
									<label class="switch-field">
										<input
											class="switch-field__control"
											type="checkbox"
											:checked="item.status === 'completed'"
											@change="
												toggleChecklistItemStatus(
													checklist.id,
													item.id,
													item.status,
													'completed',
												)
											"
										/>
										<span class="switch-field__label">Выполнено</span>
									</label>

									<label class="switch-field">
										<input
											class="switch-field__control"
											type="checkbox"
											:checked="item.status === 'skipped'"
											@change="
												toggleChecklistItemStatus(
													checklist.id,
													item.id,
													item.status,
													'skipped',
												)
											"
										/>
										<span class="switch-field__label">Не используется</span>
									</label>
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
								<span v-if="brief.status === 'completed'" class="brief-card__answer">
									{{ formatBriefAnswer(brief.answers[question.id]) }}
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
