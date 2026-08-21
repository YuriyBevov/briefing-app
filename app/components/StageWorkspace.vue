<script setup lang="ts">
import type { Checklist, ProjectStage } from "~/composables/useProjectStore";

const props = defineProps<{
	title: ProjectStage;
}>();

const actions = ["Закрыть этап"];
const { getBriefsByStage, getChecklistsByStage } = useProjectStore();

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
							<span class="checklist-card__title">{{ checklist.title }}</span>
							<span class="checklist-card__meta">
								{{ getChecklistProgress(checklist) }}% ·
								{{ getRequiredOpenCount(checklist) }} обязательных пунктов
							</span>
						</summary>

						<ul class="checklist-card__list">
							<li v-for="item in checklist.items" :key="item.id" class="checklist-card__item">
								<span class="checklist-card__item-text">{{ item.text }}</span>
								<span class="checklist-card__item-status">
									{{ item.required ? "Обязательный" : "Необязательный" }}
								</span>
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
					<article v-for="brief in briefs" :key="brief.id" class="brief-card">
						<div class="brief-card__body">
							<span class="brief-card__title">{{ brief.title }}</span>
							<span class="brief-card__meta">Черновик · {{ brief.questions.length }} вопросов</span>
						</div>
					</article>
				</div>

				<p v-else class="card-description">Создать бриф</p>
			</section>
		</div>
	</section>
</template>
