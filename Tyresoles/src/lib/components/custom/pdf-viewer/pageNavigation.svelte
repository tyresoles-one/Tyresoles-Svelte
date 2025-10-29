<script lang="ts">
	import { Button } from '../button';

	let {
		maxPages = $bindable(1),
		currentPage = $bindable(1),
		disabled
	} = $props<{
		maxPages?: number;
		currentPage?: number;
		disabled?: boolean;
	}>();

	const handlePrevious = () => {
		currentPage -= 1;
	};
	const handleNext = () => {
		currentPage += 1;
	};
</script>

<div class="flex items-center gap-1 px-1">
	<Button
		variant="ghost"
		size="icon"
		disabled={disabled || currentPage === 1}
		icon="ChevronLeft"
		onclick={handlePrevious}
	/>
	<div class="whitespace-nowrap">{`${currentPage} / ${maxPages}`}</div>
	<Button
		variant="ghost"
		size="icon"
		disabled={disabled || currentPage === maxPages}
		icon="ChevronRight"
		onclick={handleNext}
	/>
</div>
