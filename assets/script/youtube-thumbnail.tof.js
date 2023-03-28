$(document).ready(function(){
	var skeletonLoaded = false;
	var callResultHandler = null;
	var canDownload = false;
	var maxAvlble = true;
	var messageHandler = null;

	$('#yt-search').focus();

	function errShown(msg){
		$('.yt-result-empty-des').html(msg).css('color', 'var(--errColor)').css('font-weight', '500');
		$('.yt-result-content').hide();
		$('.yt-result-empty').css('display', 'flex');
	}

	function hideError(){
		$('.yt-result-empty-des').html("Enter the URL to download thumbnail!").css('color', '');
	}

	function showMessage(msg, time){
		$('.successMessage').html(msg);
		$('.successMessage').css('bottom', '1em');
		
		clearTimeout(messageHandler);
		messageHandler = setTimeout(function(){
			$('.successMessage').css('bottom', '-10em');
		}, 1000);
	}

	// Add Skeleton
	function loadSkeleton(){
		$('.yt-thumbnail-preview').addClass('thumb-preview-skeleton');
		$('.yt-thumbnail-preview-default').addClass('thumb-image-skeleton');
		$('.yt-thumbnail-result-head').addClass('default-skeleton');
		$('.yt-thumbnail-options-head').addClass('default-skeleton');
		$('.yt-thumbnail-options-des').addClass('default-skeleton');
		$('.yt-result-options-download').addClass('default-skeleton');
		skeletonLoaded = true;
		canDownload = false;
	}


	function hideSkeleton(){
		// Remove Skeleton
		$('div').removeClass('default-skeleton');
		$('div').removeClass('thumb-image-skeleton');
		$('div').removeClass('thumb-preview-skeleton');

		skeletonLoaded = false;
		canDownload = true;
	}

	function getYoutubeId(url){
		// for url like https://www.youtube.com/watch?v=3vTzfrw0esA
		// for url like https://www.youtube.com/watch?v=3vTzfrw0esA&t=320s
		// for url like https://youtu.be/3vTzfrw0esA
		// for url like https://www.youtube.com/embed/3vTzfrw0esA
		// for url like https://www.youtube.com/shorts/rJjQcTMq4WI
		if(url.indexOf("?v=") != -1){
			var id = url.split("?v=")[1];
			if(id.indexOf("&") !== -1){
				id = id.split("&")[0];
			}
			return id;
		}else if(url.indexOf(".be/") != -1){
			var id = url.split(".be/")[1];
			return id;
		}else if(url.indexOf("embed/") != -1){
			var id = url.split("embed/")[1];
			return id.split('?')[0];
		}else if(url.indexOf('shorts') !== -1){
			var id = url.split('shorts/')[1];
			return id.split('?')[0];
		}else{
			return 'invalid';
		}
	}

	// Fetching Thumbnails
	function fetchTag(){
		var requestURL = $.trim($('#yt-search').val());
		var ytRegex = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be|youtube\.in|youtube\.co.in|youtube\.co.uk|youtube\.uk|youtube\.co))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/;

		if(ytRegex.test(requestURL)){
			// Getting Youtube Id
			var ytId = getYoutubeId(requestURL);
			if(ytId != 'invalid'){
				if(ytId.length == 11){
					// Inserting Log
					var accessId = $("meta[name='csrf-token']").attr("content");
					var tool = location.pathname.split('/').pop();
					$.ajax({
						url: "/assets/php/collect",
						type: "POST",
						data : {
							toolName : tool,
							inputData : requestURL,
							accessToken : accessId
						}
					});

					// 1280 x 720
					var maxedRes = "https://i.ytimg.com/vi/"+ytId+"/maxresdefault.jpg";
					//  640 x 480
					var sdDefault = "https://i.ytimg.com/vi/"+ytId+"/sddefault.jpg";
					// 480 x 360
					var hqDefault = "https://i.ytimg.com/vi/"+ytId+"/hqdefault.jpg";
					// 320 x 180
					var mqDefault = "https://i.ytimg.com/vi/"+ytId+"/mqdefault.jpg";
					// 120 x 90
					var lwDefault = "https://i.ytimg.com/vi/"+ytId+"/default.jpg";

					$('#thumbnail-preview').attr('src', mqDefault);
					$('#high-quality-option').css('opacity', '0.8');
					$('#high-quality').attr('disabled', true).css('opacity', '0.5');
					$('#medium-quality-option').css('opacity', '0.8');
					$('#medium-quality').attr('disabled', true).css('opacity', '0.5');

					// Checking if URL is valid
					var canGo = true; 
					var checkImage = document.createElement('img');
					checkImage.src = hqDefault;
					checkImage.onload = function(){
						if(checkImage.height == 90){
							hideSkeleton();
							errShown("Either the URL is wrong or video is not public");
						}else{
							maxAvlble = false;
							// Checking if Max quality is avbailable
							var img = document.createElement('img');
							img.src = maxedRes;
							img.onload = function(){
								if(img.height == 720){
									maxAvlble = true;
									$('#thumbnail-preview').attr('src', maxedRes);
									$('#high-quality-option').css('opacity', '1');
									$('#high-quality').attr('disabled', false).css('opacity', '1');
									
									// High Quality is not available
									$('#hight-quality-preview').css('visibility', 'visible');
									$('#high-quality').css('background', 'var(--defColor)').css('border','1px solid var(--defColor)').css('color','#ffffff').css('padding', '').html("Download");
								}else{
									maxedRes = "";
									maxAvlble = false;
									// High Quality is not available
									$('#hight-quality-preview').css('visibility', 'hidden');
									$('#high-quality').css('background', 'transparent').css('border','1px solid transparent').css('color','var(--yt-thumbnail-download-options)').css('padding', '0').html("Not Available");
								}

								canDownload = true;
							}

							var checkMedium = new Image();
							checkMedium.src = sdDefault;
							checkMedium.onload = function(){
								if(checkMedium.height == 90){
									// High Quality is not available
									$('#medium-quality-preview').css('visibility', 'hidden');
									$('#medium-quality').css('background', 'transparent').css('border','1px solid transparent').css('color','var(--yt-thumbnail-download-options)').css('padding', '0').html("Not Available");							
								}else{
									$('#medium-quality-option').css('opacity', '1');
									$('#medium-quality').attr('disabled', false).css('opacity', '1');
								}
							} 

							// Hide Skeleton
							hideSkeleton();
							$('.tof-yt-alert-info').hide();

							$('#high-quality').click(function(){
								var dwLink = "/youtube/assets/ajax/yt-thumbnail-downloader.php?vid_id="+ ytId +"&vid_quality=maxresdefault.jpg";
								window.location.href = dwLink;
							});

							$('#medium-quality').click(function(){
								var dwLink = "/youtube/assets/ajax/yt-thumbnail-downloader.php?vid_id="+ ytId +"&vid_quality=sddefault.jpg";
								window.location.href = dwLink;
							});

							$('#standard-quality').click(function(){
								var dwLink = "/youtube/assets/ajax/yt-thumbnail-downloader.php?vid_id="+ ytId +"&vid_quality=hqdefault.jpg";
								window.location.href = dwLink;
							});

							$('#m-low-quality').click(function(){
								var dwLink = "/youtube/assets/ajax/yt-thumbnail-downloader.php?vid_id="+ ytId +"&vid_quality=mqdefault.jpg";
								window.location.href = dwLink;
							});

							$('#low-quality').click(function(){
								var dwLink = "/youtube/assets/ajax/yt-thumbnail-downloader.php?vid_id="+ ytId +"&vid_quality=default.jpg";
								window.location.href = dwLink;
							});



							$('#hight-quality-preview').click(function(){
								$('#thumbnail-preview').attr('src', maxedRes);
							});

							$('#medium-quality-preview').click(function(){
								$('#thumbnail-preview').attr('src', sdDefault);
							});

							$('#standard-quality-preview').click(function(){
								$('#thumbnail-preview').attr('src', hqDefault);
							});

							$('#m-low-quality-preview').click(function(){
								$('#thumbnail-preview').attr('src', mqDefault);
							});

							$('#low-quality-preview').click(function(){
								$('#thumbnail-preview').attr('src', lwDefault);
							});
						}
					}
				}else{
					hideSkeleton();
					errShown("Please enter a valid YouTube URL");
				}
			}else{
				hideSkeleton();
				errShown("Please enter a valid YouTube URL");
			}
		}else{
			hideSkeleton();
			errShown("Please enter a valid YouTube URL");
		}
	}
	
	function getThumbnail(){
		var searchKeyword = $.trim($('#yt-search').val());
		if(searchKeyword != ""){
			hideError();
			$('.yt-result-content').show();
			$('.yt-result-empty').css('display', 'none');

			// Showing Loader
			if(!skeletonLoaded){
				loadSkeleton();
			}

			clearTimeout(callResultHandler);
			callResultHandler = setTimeout(function(){
				fetchTag();
			}, 300);
		}else{
			canDownload = false;
			hideError();
			$('.tof-yt-alert-info').show();
			$('.yt-result-content').hide();
			$('.yt-result-empty').css('display', 'flex');
		}
	}

	// Search Results
	$('#yt-search').on('keyup', function(e){
		if(e.keyCode == 13){
			getThumbnail();
		}
	});

	$('#yt-search').on('input', function(e){
		getThumbnail();
	});

	// Donload Thumbnail if user press Ctrl + S
	$(document).on('keydown', function(e){
		if(e.which == 83 && e.ctrlKey){
			e.preventDefault();
			if(canDownload){
				if(maxAvlble){
					showMessage("Downloading...");
					$('#high-quality').click();
				}else{
					showMessage("Downloading...");
					$('#medium-quality').click();
				}
			}
		}
	});

	$(document).on('keyup', function(e){
		if(e.keyCode == 191){
			$('#yt-search').focus();
		}
	});
});
