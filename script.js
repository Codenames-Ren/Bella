// 导入 Transformers.js 的 pipeline
import { pipeline } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1/dist/transformers.min.js";

document.addEventListener("DOMContentLoaded", function () {
  // --- 加载屏幕处理 ---
  const loadingScreen = document.getElementById("loading-screen");
  setTimeout(() => {
    loadingScreen.style.opacity = "0";
    // 在动画结束后将其隐藏，以防它阻碍交互
    setTimeout(() => {
      loadingScreen.style.display = "none";
    }, 500); // 这个时间应该匹配 CSS 中的 transition 时间
  }, 1500); // 1.5秒后开始淡出

  // 获取需要的 DOM 元素
  let video1 = document.getElementById("video1");
  let video2 = document.getElementById("video2");
  const micButton = document.getElementById("mic-button");
  const favorabilityBar = document.getElementById("favorability-bar");
  const floatingButton = document.getElementById("floating-button");
  const menuContainer = document.getElementById("menu-container");
  const menuItems = document.querySelectorAll(".menu-item");

  // --- 情感分析元素 ---
  const sentimentInput = document.getElementById("sentiment-input");
  const analyzeButton = document.getElementById("analyze-button");
  const sentimentResult = document.getElementById("sentiment-result");

  let activeVideo = video1;
  let inactiveVideo = video2;

  // 视频列表
  const videoList = [
    "视频资源/3D 建模图片制作.mp4",
    "视频资源/jimeng-2025-07-16-1043-笑着优雅的左右摇晃，过一会儿手扶着下巴，保持微笑.mp4",
    "视频资源/jimeng-2025-07-16-4437-比耶，然后微笑着优雅的左右摇晃.mp4",
    "视频资源/生成加油视频.mp4",
    "视频资源/生成跳舞视频.mp4",
    "视频资源/负面/jimeng-2025-07-16-9418-双手叉腰，嘴巴一直在嘟囔，表情微微生气.mp4",
  ];

  // --- 视频交叉淡入淡出播放功能 ---
  function switchVideo() {
    // 1. 选择下一个视频
    const currentVideoSrc = activeVideo
      .querySelector("source")
      .getAttribute("src");
    let nextVideoSrc = currentVideoSrc;
    while (nextVideoSrc === currentVideoSrc) {
      const randomIndex = Math.floor(Math.random() * videoList.length);
      nextVideoSrc = videoList[randomIndex];
    }

    // 2. 设置不活动的 video 元素的 source
    inactiveVideo.querySelector("source").setAttribute("src", nextVideoSrc);
    inactiveVideo.load();

    // 3. 当不活动的视频可以播放时，执行切换
    inactiveVideo.addEventListener(
      "canplaythrough",
      function onCanPlayThrough() {
        // 确保事件只触发一次
        inactiveVideo.removeEventListener("canplaythrough", onCanPlayThrough);

        // 4. 播放新视频
        inactiveVideo.play().catch((error) => {
          console.error("Video play failed:", error);
        });

        // 5. 切换 active class 来触发 CSS 过渡
        activeVideo.classList.remove("active");
        inactiveVideo.classList.add("active");

        // 6. 更新角色
        [activeVideo, inactiveVideo] = [inactiveVideo, activeVideo];

        // 为新的 activeVideo 绑定 ended 事件
        activeVideo.addEventListener("ended", switchVideo, { once: true });
      },
      { once: true }
    ); // 使用 { once: true } 确保事件只被处理一次
  }

  // 初始启动
  activeVideo.addEventListener("ended", switchVideo, { once: true });

  // --- 语音识别核心 ---
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition;

  // 检查浏览器是否支持语音识别
  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true; // 持续识别
    recognition.lang = "zh-CN"; // 设置语言为中文
    recognition.interimResults = true; // 获取临时结果

    recognition.onresult = (event) => {
      const transcriptContainer = document.getElementById("transcript");
      let final_transcript = "";
      let interim_transcript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final_transcript += event.results[i][0].transcript;
        } else {
          interim_transcript += event.results[i][0].transcript;
        }
      }

      // 显示最终识别结果
      transcriptContainer.textContent = final_transcript || interim_transcript;

      // 基于关键词的情感分析和视频切换
      if (final_transcript) {
        analyzeAndReact(final_transcript);
      }
    };

    recognition.onerror = (event) => {
      console.error("语音识别错误:", event.error);
    };
  } else {
    console.log("您的浏览器不支持语音识别功能。");
    // 可以在界面上给用户提示
  }

  // --- 麦克风按钮交互 ---
  let isListening = false;

  micButton.addEventListener("click", function () {
    if (!SpeechRecognition) return; // 如果不支持，则不执行任何操作

    isListening = !isListening;
    micButton.classList.toggle("is-listening", isListening);
    const transcriptContainer = document.querySelector(".transcript-container");
    const transcriptText = document.getElementById("transcript");

    if (isListening) {
      transcriptText.textContent = "聆听中..."; // 立刻显示提示
      transcriptContainer.classList.add("visible");
      recognition.start();
    } else {
      recognition.stop();
      transcriptContainer.classList.remove("visible");
      transcriptText.textContent = ""; // 清空文本
    }
  });

  // --- 悬浮按钮交互 ---
  floatingButton.addEventListener("click", (event) => {
    event.stopPropagation(); // 防止事件冒泡到 document
    menuContainer.classList.toggle("hidden");
  });

  menuItems.forEach((item) => {
    item.addEventListener("click", function () {
      const videoSrc = this.getAttribute("data-video");
      playSpecificVideo(videoSrc);
      menuContainer.classList.add("hidden");
    });
  });

  // 点击菜单外部区域关闭菜单
  document.addEventListener("click", () => {
    if (!menuContainer.classList.contains("hidden")) {
      menuContainer.classList.add("hidden");
    }
  });

  // 阻止菜单自身的点击事件冒泡
  menuContainer.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  function playSpecificVideo(videoSrc) {
    const currentVideoSrc = activeVideo
      .querySelector("source")
      .getAttribute("src");
    if (videoSrc === currentVideoSrc) return;

    inactiveVideo.querySelector("source").setAttribute("src", videoSrc);
    inactiveVideo.load();

    inactiveVideo.addEventListener(
      "canplaythrough",
      function onCanPlayThrough() {
        inactiveVideo.removeEventListener("canplaythrough", onCanPlayThrough);
        activeVideo.pause(); // 暂停当前视频，防止其 'ended' 事件触发切换
        inactiveVideo
          .play()
          .catch((error) => console.error("Video play failed:", error));
        activeVideo.classList.remove("active");
        inactiveVideo.classList.add("active");
        [activeVideo, inactiveVideo] = [inactiveVideo, activeVideo];
        activeVideo.addEventListener("ended", switchVideo, { once: true });
      },
      { once: true }
    );
  }

  // --- 情感分析与反应 ---
  const positiveWords = ["开心", "高兴", "喜欢", "太棒了", "你好", "漂亮"];
  const negativeWords = ["难过", "生气", "讨厌", "伤心"];

  const positiveVideos = [
    "视频资源/jimeng-2025-07-16-1043-笑着优雅的左右摇晃，过一会儿手扶着下巴，保持微笑.mp4",
    "视频资源/jimeng-2025-07-16-4437-比耶，然后微笑着优雅的左右摇晃.mp4",
    "视频资源/生成加油视频.mp4",
    "视频资源/生成跳舞视频.mp4",
  ];
  const negativeVideo =
    "视频资源/负面/jimeng-2025-07-16-9418-双手叉腰，嘴巴一直在嘟囔，表情微微生气.mp4";

  // --- 本地模型情感分析 ---
  let classifier;
  analyzeButton.addEventListener("click", async () => {
    const text = sentimentInput.value;
    if (!text) return;

    sentimentResult.textContent = "正在分析中...";

    // 第一次点击时，初始化分类器
    if (!classifier) {
      try {
        classifier = await pipeline("sentiment-analysis");
      } catch (error) {
        console.error("模型加载失败:", error);
        sentimentResult.textContent = "抱歉，模型加载失败了。";
        return;
      }
    }

    // 进行情感分析
    try {
      const result = await classifier(text);
      // 显示最主要的情绪和分数
      const primaryEmotion = result[0];
      sentimentResult.textContent = `情绪: ${
        primaryEmotion.label
      }, 分数: ${primaryEmotion.score.toFixed(2)}`;
    } catch (error) {
      console.error("情感分析失败:", error);
      sentimentResult.textContent = "分析时出错了。";
    }
  });

  // --- 本地语音识别 --- //
  const localMicButton = document.getElementById("local-mic-button");
  const localAsrResult = document.getElementById("local-asr-result");

  let recognizer = null;
  let mediaRecorder = null;
  let isRecording = false;

  const handleRecord = async () => {
    // 状态切换：如果正在录音，则停止
    if (isRecording) {
      mediaRecorder.stop();
      isRecording = false;
      localMicButton.textContent = "开始本地识别";
      localMicButton.classList.remove("recording");
      return;
    }

    // 初始化模型（仅一次）
    if (!recognizer) {
      localAsrResult.textContent = "正在加载语音识别模型...";
      try {
        recognizer = await pipeline(
          "automatic-speech-recognition",
          "Xenova/whisper-tiny"
        );
        localAsrResult.textContent = "模型加载完毕，请开始说话...";
      } catch (error) {
        console.error("模型加载失败:", error);
        localAsrResult.textContent = "抱歉，模型加载失败了。";
        return;
      }
    }

    // 开始录音
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorder.addEventListener("dataavailable", (event) => {
        audioChunks.push(event.data);
      });

      mediaRecorder.addEventListener("stop", async () => {
        const audioBlob = new Blob(audioChunks, {
          type: mediaRecorder.mimeType,
        });
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();

        // 检查音频数据是否为空
        if (arrayBuffer.byteLength === 0) {
          localAsrResult.textContent = "没有录制到音频，请重试。";
          return;
        }

        try {
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          const rawAudio = audioBuffer.getChannelData(0);

          localAsrResult.textContent = "正在识别...";
          const output = await recognizer(rawAudio);
          localAsrResult.textContent = output.text || "未能识别出任何内容。";
        } catch (e) {
          console.error("音频解码或识别失败:", e);
          localAsrResult.textContent = "处理音频时出错，请再试一次。";
        }
      });

      mediaRecorder.start();
      isRecording = true;
      localMicButton.textContent = "正在录音... 点击停止";
      localMicButton.classList.add("recording");
    } catch (error) {
      console.error("语音识别失败:", error);
      localAsrResult.textContent = "无法访问麦克风或识别出错。";
      isRecording = false; // 重置状态
      localMicButton.textContent = "开始本地识别";
      localMicButton.classList.remove("recording");
    }
  };

  localMicButton.addEventListener("click", handleRecord);

  function analyzeAndReact(text) {
    let reaction = "neutral"; // 默认为中性

    if (positiveWords.some((word) => text.includes(word))) {
      reaction = "positive";
    } else if (negativeWords.some((word) => text.includes(word))) {
      reaction = "negative";
    }

    if (reaction !== "neutral") {
      switchVideoByEmotion(reaction);
    }
  }

  function switchVideoByEmotion(emotion) {
    let nextVideoSrc;
    if (emotion === "positive") {
      const randomIndex = Math.floor(Math.random() * positiveVideos.length);
      nextVideoSrc = positiveVideos[randomIndex];
    } else {
      // negative
      nextVideoSrc = negativeVideo;
    }

    // 避免重复播放同一个视频
    const currentVideoSrc = activeVideo
      .querySelector("source")
      .getAttribute("src");
    if (nextVideoSrc === currentVideoSrc) return;

    // --- 以下逻辑与 switchVideo 函数类似，用于切换视频 ---
    inactiveVideo.querySelector("source").setAttribute("src", nextVideoSrc);
    inactiveVideo.load();

    inactiveVideo.addEventListener(
      "canplaythrough",
      function onCanPlayThrough() {
        inactiveVideo.removeEventListener("canplaythrough", onCanPlayThrough);
        activeVideo.pause(); // 暂停当前视频，防止其 'ended' 事件触发切换
        inactiveVideo
          .play()
          .catch((error) => console.error("Video play failed:", error));
        activeVideo.classList.remove("active");
        inactiveVideo.classList.add("active");
        [activeVideo, inactiveVideo] = [inactiveVideo, activeVideo];
        // 情感触发的视频播放结束后，回归随机播放
        activeVideo.addEventListener("ended", switchVideo, { once: true });
      },
      { once: true }
    );
  }
});
