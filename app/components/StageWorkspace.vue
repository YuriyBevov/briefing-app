<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
import type {
	Brief,
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
	reorderBriefs,
	reorderChecklists,
	reorderWorkspaceBlocks,
	updateBriefLinkTitle,
	updateChecklistItemComment,
	updateChecklistItemStatus,
} = useProjectStore();
const { openCreationModal, openEditModal } = useCreationModal();
const copiedLinkId = ref("");
const deletingChecklistId = ref("");
const deletingBriefId = ref("");
const deletingBriefLink = ref<{
	briefId: string;
	linkId: string;
	title: string;
} | null>(null);
const renamingBriefLink = ref<{
	briefId: string;
	briefTitle: string;
	link: BriefLink;
} | null>(null);
const briefLinkTitleForm = reactive({
	title: "",
});

const section = computed(() => data.value.sections.find((item) => item.id === props.sectionId));
const pageTitle = useState("app-page-title", () => "Раздел");
watchEffect(() => {
	pageTitle.value = section.value?.title ?? "Раздел";
});
const canViewSection = computed(() =>
	Boolean(section.value?.isActive) && canUsePermission(`view_section_${props.sectionId}`).value
);
const checklists = getChecklistsBySection(props.sectionId);
const briefs = getBriefsBySection(props.sectionId);
const stageBlocks = [
	{
		id: "checklists",
		title: "Чеклисты",
		createLabel: "Создать чеклист",
		createIcon: "plus",
	},
	{
		id: "briefs",
		title: "Брифы",
		createLabel: "Создать бриф",
		createIcon: "plus",
	},
] as const;
const collapsedStageBlocks = useState<Record<string, boolean>>("stage-workspace-collapsed-blocks", () => ({
	checklists: true,
	briefs: true,
}));
const orderedStageBlocks = computed({
	get: () => {
		const blocksById = new Map(stageBlocks.map((block) => [block.id, block]));
		const orderedBlocks = data.value.workspaceBlockOrder
			.map((blockId) => blocksById.get(blockId))
			.filter(Boolean) as Array<(typeof stageBlocks)[number]>;
		const orderedIds = new Set(orderedBlocks.map((block) => block.id));

		return [
			...orderedBlocks,
			...stageBlocks.filter((block) => !orderedIds.has(block.id)),
		];
	},
	set: (blocks) => {
		reorderWorkspaceBlocks(blocks.map((block) => block.id));
	},
});
const orderedChecklists = computed({
	get: () => checklists.value,
	set: (items: Checklist[]) => {
		reorderChecklists(items.map((item) => item.id));
	},
});
const orderedBriefs = computed({
	get: () => briefs.value,
	set: (items: Brief[]) => {
		reorderBriefs(items.map((item) => item.id));
	},
});

const isStageBlockCollapsed = (blockId: string) => collapsedStageBlocks.value[blockId] ?? true;

const getStageBlockItemCount = (blockId: string) => {
	if (blockId === "checklists") {
		return orderedChecklists.value.length;
	}

	if (blockId === "briefs") {
		return orderedBriefs.value.length;
	}

	return 0;
};

const toggleStageBlock = (blockId: string) => {
	if (getStageBlockItemCount(blockId) === 0) {
		return;
	}

	collapsedStageBlocks.value = {
		...collapsedStageBlocks.value,
		[blockId]: !isStageBlockCollapsed(blockId),
	};
};

const openCreateModalByBlock = (blockId: string) => {
	openCreationModal(blockId === "checklists" ? "checklist" : "brief");
};

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
	deletingChecklistId.value = id;
};

const closeDeleteChecklistModal = () => {
	deletingChecklistId.value = "";
};

const confirmRemoveChecklist = () => {
	if (!deletingChecklistId.value) {
		return;
	}

	deleteChecklist(deletingChecklistId.value);
	closeDeleteChecklistModal();
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

const canExpandBrief = (brief: Brief) => brief.links.length > 0;

const preventSummaryToggle = (event: MouseEvent) => {
	event.preventDefault();
};

const removeBrief = (id: string) => {
	deletingBriefId.value = id;
};

const closeDeleteBriefModal = () => {
	deletingBriefId.value = "";
};

const confirmRemoveBrief = () => {
	if (!deletingBriefId.value) {
		return;
	}

	deleteBrief(deletingBriefId.value);
	closeDeleteBriefModal();
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
	"label--pending": status === "pending",
	"label--revision-pending": status === "revision_pending",
	"label--completed": status === "completed" || status === "revision_completed",
	"label--in-work": status === "in_work",
	"label--archived": status === "archived",
});

const toggleClosestDetails = (event: MouseEvent) => {
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
	const brief = data.value.briefs.find((item) => item.id === briefId);
	const link = brief?.links.find((item) => item.id === linkId);

	if (!brief || !link) {
		return;
	}

	deletingBriefLink.value = {
		briefId,
		linkId,
		title: getBriefLinkTitle(link, brief.title),
	};
};

const closeDeleteBriefLinkModal = () => {
	deletingBriefLink.value = null;
};

const confirmRemoveBriefLink = () => {
	if (!deletingBriefLink.value) {
		return;
	}

	deleteBriefLink(deletingBriefLink.value.briefId, deletingBriefLink.value.linkId);
	closeDeleteBriefLinkModal();
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
		<VueDraggable
			v-model="orderedStageBlocks"
			class="stage-page__workspace"
			handle=".workspace-block__drag"
			:animation="180"
		>
			<BaseWorkspaceBlock
				v-for="block in orderedStageBlocks"
				:key="block.id"
				:title="block.title"
				:create-label="block.createLabel"
				:create-icon="block.createIcon"
				:collapsed="isStageBlockCollapsed(block.id)"
				:toggle-disabled="getStageBlockItemCount(block.id) === 0"
				@create="openCreateModalByBlock(block.id)"
				@toggle="toggleStageBlock(block.id)"
			>
				<VueDraggable
					v-if="block.id === 'checklists' && !isStageBlockCollapsed(block.id) && orderedChecklists.length"
					v-model="orderedChecklists"
					class="content-list"
					handle=".content-card__drag"
					:animation="180"
				>
					<details
						v-for="checklist in orderedChecklists"
						:key="checklist.id"
						class="content-card checklist-card"
					>
						<summary class="content-card__header" @click="preventSummaryToggle">
							<button class="content-card__drag" type="button" aria-label="Перетащить" title="Перетащить" @click.stop.prevent>
								<BaseIcon class="content-card__drag-icon" name="drag-handle" />
							</button>
							<div class="content-card__summary">
								<span class="content-card__title">{{ checklist.title }}</span>
								<span class="content-card__meta">
									{{ getChecklistProgress(checklist) }}% ·
									{{ getRequiredOpenCount(checklist) }} обязательных пунктов
								</span>
							</div>
							<div class="content-card__actions">
								<BaseActionMenu label="Действия чеклиста">
									<button class="action-menu__item" type="button" @click="editChecklist(checklist.id)">
										<BaseIcon class="action-menu__icon" name="edit" />
										<span>Изменить</span>
									</button>
									<button class="action-menu__item action-menu__item--danger" type="button" @click="removeChecklist(checklist.id)">
										<BaseIcon class="action-menu__icon" name="trash" />
										<span>Удалить</span>
									</button>
								</BaseActionMenu>
							</div>
							<BaseDisclosureToggle
								class="content-card__toggle"
								label="Развернуть чеклист"
								@click.stop.prevent="toggleClosestDetails"
							/>
						</summary>

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
									<BaseCheckbox
										:checked="item.status === 'completed'"
										label="Выполнено"
										tone="success"
										hide-label
										@change="
											toggleChecklistItemStatus(
												checklist.id,
												item.id,
												item.status,
												'completed',
											)
										"
									/>

									<BaseCheckbox
										:checked="item.status === 'skipped'"
										label="Не используется"
										tone="danger"
										hide-label
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
				</VueDraggable>

				<VueDraggable
					v-else-if="block.id === 'briefs' && !isStageBlockCollapsed(block.id) && orderedBriefs.length"
					v-model="orderedBriefs"
					class="content-list"
					handle=".content-card__drag"
					:animation="180"
				>
					<details
						v-for="brief in orderedBriefs"
						:key="brief.id"
						class="content-card brief-card"
						:class="{ 'content-card--empty': !canExpandBrief(brief) }"
					>
						<summary class="content-card__header" @click="preventSummaryToggle">
							<button class="content-card__drag" type="button" aria-label="Перетащить" title="Перетащить" @click.stop.prevent>
								<BaseIcon class="content-card__drag-icon" name="drag-handle" />
							</button>
							<div class="content-card__summary">
								<span class="content-card__title">{{ brief.title }}</span>
								<span class="content-card__meta">
									{{ getBriefMeta(brief.links, brief.questions.length) }}
								</span>
							</div>
							<div class="content-card__actions">
								<BaseActionMenu label="Действия брифа">
									<button class="action-menu__item" type="button" @click="editBrief(brief.id)">
										<BaseIcon class="action-menu__icon" name="edit" />
										<span>Изменить</span>
									</button>
									<button class="action-menu__item" type="button" @click="createClientLink(brief.id)">
										<BaseIcon class="action-menu__icon" name="plus" />
										<span>Создать ссылку</span>
									</button>
									<button class="action-menu__item action-menu__item--danger" type="button" @click="removeBrief(brief.id)">
										<BaseIcon class="action-menu__icon" name="trash" />
										<span>Удалить</span>
									</button>
								</BaseActionMenu>
							</div>
							<BaseDisclosureToggle
								class="content-card__toggle"
								:disabled="!canExpandBrief(brief)"
								label="Развернуть бриф"
								@click.stop.prevent="toggleClosestDetails"
							/>
						</summary>

						<div v-if="brief.links.length" class="brief-card__links">
							<details
								v-for="history in getBriefLinkHistories(brief.links)"
								:key="history.id"
								class="brief-card__link-item"
							>
								<summary class="brief-card__link-summary" @click="preventSummaryToggle">
									<div class="brief-card__link-node brief-card__link-node--current">
										<div
											v-if="history.links[0]"
											class="brief-card__link-header"
										>
											<div class="brief-card__link-main">
												<a
													class="brief-card__link"
													:href="getBriefLink(history.links[0].token)"
													target="_blank"
													rel="noreferrer"
													@click.stop
												>
													<span class="brief-card__link-title">
														{{ getBriefLinkTitle(history.links[0], brief.title) }}
													</span>
													<span class="brief-card__link-url">
														{{ getBriefLink(history.links[0].token) }}
													</span>
												</a>
											</div>
											<div
												class="label"
												:class="getBriefLinkStatusClasses(history.links[0].status)"
											>
												{{ getBriefLinkStatusLabel(history.links[0].status) }}
											</div>
											<div class="brief-card__link-controls">
												<BaseActionMenu
													v-if="history.links[0].status !== 'archived'"
													label="Действия ссылки на бриф"
												>
													<button
														class="action-menu__item"
														type="button"
														@click="copyBriefLink(history.links[0])"
													>
														<BaseIcon class="action-menu__icon" name="copy" />
														<span>{{ copiedLinkId === history.links[0].id ? 'Скопировано' : 'Копировать' }}</span>
													</button>
													<button
														class="action-menu__item"
														type="button"
														@click="openRenameBriefLinkModal(brief.id, brief.title, history.links[0])"
													>
														<BaseIcon class="action-menu__icon" name="edit" />
														<span>Редактировать</span>
													</button>
													<button
														class="action-menu__item"
														type="button"
														:disabled="
															history.links[0].status === 'pending' ||
															history.links[0].status === 'revision_pending' ||
															history.links[0].status === 'archived'
														"
														@click="openBriefForFilling(brief.id, history.links[0].id)"
													>
														<BaseIcon class="action-menu__icon" name="unlock" />
														<span>Создать ссылку</span>
													</button>
													<button
														class="action-menu__item"
														type="button"
														:disabled="
															history.links[0].status !== 'completed' &&
															history.links[0].status !== 'revision_completed'
														"
														@click="acceptBriefToWork(brief.id, history.links[0].id)"
													>
														<BaseIcon class="action-menu__icon" name="check" />
														<span>Принять в работу</span>
													</button>
													<button
														class="action-menu__item action-menu__item--danger"
														type="button"
														@click="removeBriefLink(brief.id, history.links[0].id)"
													>
														<BaseIcon class="action-menu__icon" name="trash" />
														<span>Удалить</span>
													</button>
												</BaseActionMenu>
												<BaseDisclosureToggle
													class="brief-card__history-toggle"
													:disabled="history.links.length <= 1"
													label="История экземпляра"
													@click.stop.prevent="toggleClosestDetails"
												/>
											</div>
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
											<a
												class="brief-card__link"
												:href="getBriefLink(link.token)"
												target="_blank"
												rel="noreferrer"
												@click.stop
											>
												<span class="brief-card__link-title">
													{{ getBriefLink(link.token) }}
												</span>
											</a>
											<div
												class="label"
												:class="getBriefLinkStatusClasses(link.status)"
											>
												{{ getBriefLinkStatusLabel(link.status) }}
											</div>
										</div>
									</div>
								</div>
							</details>
						</div>
					</details>
				</VueDraggable>
			</BaseWorkspaceBlock>
		</VueDraggable>
	</section>

	<section v-else class="stage-page">
		<section class="workspace-block">
			<p class="card-description">Раздел отключён или у вас нет прав на его просмотр.</p>
		</section>
	</section>

	<BaseModal
		v-if="renamingBriefLink"
		title="Изменить название ссылки"
		@close="closeRenameBriefLinkModal"
	>
		<form id="brief-link-title-form" class="modal-form" @submit.prevent="submitBriefLinkTitle">
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
		</form>

		<template #footer>
			<button class="button button--primary" type="submit" form="brief-link-title-form">
				Сохранить
			</button>
			<button class="button button--secondary" type="button" @click="closeRenameBriefLinkModal">
				Отменить
			</button>
		</template>
	</BaseModal>

	<BaseModal v-if="deletingChecklistId" title="Удалить чеклист?" @close="closeDeleteChecklistModal">
		<div class="modal-confirm">
			<p class="modal-confirm__text">
				Чеклист будет удалён. Это действие нельзя отменить.
			</p>
		</div>

		<template #footer>
			<button class="button button--danger" type="button" @click="confirmRemoveChecklist">
				Удалить
			</button>
			<button class="button button--secondary" type="button" @click="closeDeleteChecklistModal">
				Отменить
			</button>
		</template>
	</BaseModal>

	<BaseModal v-if="deletingBriefId" title="Удалить бриф?" @close="closeDeleteBriefModal">
		<div class="modal-confirm">
			<p class="modal-confirm__text">
				Бриф будет удалён вместе со всеми созданными ссылками. Это действие нельзя отменить.
			</p>
		</div>

		<template #footer>
			<button class="button button--danger" type="button" @click="confirmRemoveBrief">
				Удалить
			</button>
			<button class="button button--secondary" type="button" @click="closeDeleteBriefModal">
				Отменить
			</button>
		</template>
	</BaseModal>

	<BaseModal
		v-if="deletingBriefLink"
		title="Удалить ссылку на бриф?"
		@close="closeDeleteBriefLinkModal"
	>
		<div class="modal-confirm">
			<p class="modal-confirm__text">
				Экземпляр «{{ deletingBriefLink.title }}» будет удалён вместе со всей историей.
			</p>
		</div>

		<template #footer>
			<button class="button button--danger" type="button" @click="confirmRemoveBriefLink">
				Удалить
			</button>
			<button class="button button--secondary" type="button" @click="closeDeleteBriefLinkModal">
				Отменить
			</button>
		</template>
	</BaseModal>
</template>
