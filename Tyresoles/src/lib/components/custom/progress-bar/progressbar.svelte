<div class="m-auto w-full">
	<div class="h-1 w-full overflow-hidden bg-slate-300">
		<div class="progress-bar-value"></div>
	</div>
</div>

<style>
	.progress-bar-value {
		width: 100%;
		height: 100%;
		background-color: rgb(0, 0, 0);
		animation: indeterminateAnimation 1s infinite linear;
		transform-origin: 0% 50%;
	}

	@keyframes indeterminateAnimation {
		0% {
			transform: translateX(0) scaleX(0);
		}
		40% {
			transform: translateX(0) scaleX(0.4);
		}
		100% {
			transform: translateX(100%) scaleX(0.5);
		}
	}
</style>
