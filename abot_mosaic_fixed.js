// Robot data will be loaded from CSV file
let robotData = {};

// Function to load CSV data
async function loadRobotDataFromCSV() {
  try {
    const response = await fetch('robot_rankings_complete.csv');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const csvText = await response.text();

    // Parse CSV data
    const lines = csvText.split('\n');

    const data = {};
    let successCount = 0;

    // Correct CSV parsing function
    function parseCSVLine(line) {
      const result = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }

      // Add the last field
      result.push(current.trim());
      return result;
    }

    // Skip the first line (header row)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        const parts = parseCSVLine(line);
        if (parts.length >= 6) {
          const [name, perception, behavior, total, developer, website] = parts;
          if (name && perception && behavior && total) {
            // Clean robot name and convert to uppercase
            // Handle special character mapping first
            let cleanName = name.trim();
            // Handle common special character encoding issues
            cleanName = cleanName.replace(/\?/g, 'ï'); // Replace ? back to ï
            cleanName = cleanName.replace(/[^\w\s\-àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]/g, ''); // Keep accent characters
            const robotName = cleanName.toUpperCase().replace(/[-_]/g, ' ');

            const perceptionVal = parseFloat(perception);
            const behaviorVal = parseFloat(behavior);
            const totalVal = parseFloat(total);

            // Validate if values are valid
            if (!isNaN(perceptionVal) && !isNaN(behaviorVal) && !isNaN(totalVal)) {
              data[robotName] = {
                originalName: cleanName, // Save original name
                perception: perceptionVal,
                behavior: behaviorVal,
                total: totalVal,
                developer: developer ? developer.trim() : 'Unknown',
                website: website ? website.trim() : ''
              };
              successCount++;
            }
          }
        }
      }
    }

    robotData = data;

    // Calculate rankings and percentiles
    calculateRankingsAndPercentiles();

    return data;
  } catch (error) {
    // If loading fails, use default data
    robotData = {
      "JIA JIA ROBOT": {
        "originalName": "Jia Jia Robot",
        "perception": 63.166,
        "behavior": 60.75,
        "total": 123.916,
        "developer": "University of Science and Technology of China",
        "website": "http://www.ustc.edu.cn"
      }
    };
    return robotData;
  }
}

// Calculate rankings and percentiles
function calculateRankingsAndPercentiles() {
  const robots = Object.entries(robotData);
  const totalCount = robots.length;

  // Sort by perception score (descending) - create new array copy
  const perceptionSorted = [...robots].sort((a, b) => b[1].perception - a[1].perception);
  // Sort by behavior score (descending) - create new array copy
  const behaviorSorted = [...robots].sort((a, b) => b[1].behavior - a[1].behavior);
  // Sort by total score (descending) - create new array copy
  const totalSorted = [...robots].sort((a, b) => b[1].total - a[1].total);

  // Add ranking and percentile information for each robot
  Object.keys(robotData).forEach(robotName => {
    const robot = robotData[robotName];

    // Calculate perception score ranking
    const perceptionRank = perceptionSorted.findIndex(([name]) => name === robotName) + 1;
    // Percentile: represents what percentage of robots score lower than current robot
    const perceptionPercentile = Math.round((totalCount - perceptionRank) / totalCount * 100);

    // Calculate behavior score ranking
    const behaviorRank = behaviorSorted.findIndex(([name]) => name === robotName) + 1;
    const behaviorPercentile = Math.round((totalCount - behaviorRank) / totalCount * 100);

    // Calculate total score ranking
    const totalRank = totalSorted.findIndex(([name]) => name === robotName) + 1;
    const totalPercentile = Math.round((totalCount - totalRank) / totalCount * 100);

    // Add ranking and percentile information
    robot.rankings = {
      perception: {
        rank: perceptionRank,
        percentile: perceptionPercentile
      },
      behavior: {
        rank: behaviorRank,
        percentile: behaviorPercentile
      },
      total: {
        rank: totalRank,
        percentile: totalPercentile
      }
    };
  });
}

// Initialize application
(async function initApp() {
  // First load robot data
  await loadRobotDataFromCSV();

  // Initialize image list (ensure originalRobotImages is available)
  if (allRobotImages.length === 0) {
    generateRobotImageList();
  }
})();

// Configuration parameters
const TEXT = 'ABOT 2.0';
const DOT_SIZE = 12; // Further reduce image block size, increase density
const DOT_GAP = 0;  // No spacing, more compact
const ANIMATION_DURATION = 1800; // Animation duration for single letter
const STAGGER_DELAY = 400; // Random delay within letter

// Dynamic screen size detection
let CANVAS_WIDTH = window.innerWidth;
let CANVAS_HEIGHT = window.innerHeight;
let FONT_SIZE = Math.min(CANVAS_WIDTH, CANVAS_HEIGHT) * 0.35; // Increase font to 35% of screen

// Greatly expand robot image list - use more images for better mosaic effect
const IMAGE_LIST = [
  'robot_picture/1_jia_jia_robot.jpg',
  'robot_picture/2_snap_bot.jpg',
  'robot_picture/3_lego-robot-1.jpg',
  'robot_picture/4_lego-robot-2.jpg',
  'robot_picture/5_mini.jpg',
  'robot_picture/6_cb2-humanoid.jpg',
  'robot_picture/7_alter-humanoid.jpg',
  'robot_picture/8_jibo.jpg',
  'robot_picture/9_buddy.jpg',
  'robot_picture/10_asimo-humanoid.jpg',
  'robot_picture/11_nao-humanoid.jpg',
  'robot_picture/12_baxter-industrial.jpg',
  'robot_picture/13_riba-ii.jpg',
  'robot_picture/14_altair-ez2.jpg',
  'robot_picture/15_aimec.jpg',
  'robot_picture/16_zenbo.jpg',
  'robot_picture/17_kirobo.jpg',
  'robot_picture/18_aldebaran-pepper.jpg',
  'robot_picture/19_romeo.jpg',
  'robot_picture/20_aida-driving-agent.jpg',
  'robot_picture/21_darwin-op.jpg',
  'robot_picture/22_mobiserv-companion.jpg',
  'robot_picture/23_robonaut.jpg',
  'robot_picture/24_zeno.jpg',
  'robot_picture/25_han.jpg',
  'robot_picture/26_albert-hubo.jpg',
  'robot_picture/27_poppy.jpg',
  'robot_picture/28_telenoid.jpg',
  'robot_picture/29_topio.jpg',
  'robot_picture/30_discorobo.jpg',
  'robot_picture/31_inmoov.jpg',
  'robot_picture/32_kismet.jpg',
  'robot_picture/33_nexi.jpg',
  'robot_picture/34_pino.jpg',
  'robot_picture/35_valkyrie.jpg',
  'robot_picture/36_atlas.jpg',
  'robot_picture/37_mertz.jpg',
  'robot_picture/38_eccerobot.jpg',
  'robot_picture/39_hiro.jpg',
  'robot_picture/40_pr2.jpg',
  'robot_picture/41_MiRAE.jpg',
  'robot_picture/42_mip2.jpg',
  'robot_picture/43_iCat.jpg',
  'robot_picture/44_tico.jpg',
  'robot_picture/45_sota.jpg',
  'robot_picture/46_domo.jpg',
  'robot_picture/47_furhat.jpg',
  'robot_picture/48_muu.jpg',
  'robot_picture/49_Emuu.jpg',
  'robot_picture/50_maggie.jpg',
  'robot_picture/51_robothespian.jpg',
  'robot_picture/52_aryan.jpg',
  'robot_picture/53_emys.jpg',
  'robot_picture/54_qrio.jpg',
  'robot_picture/55_irobi-q.jpg',
  'robot_picture/56_papero.jpg',
  'robot_picture/57_iCub.jpg',
  'robot_picture/58_Genie.jpg',
  'robot_picture/59_Anette.jpg',
  'robot_picture/60_Echo-Plus.jpg',
  'robot_picture/61_BINA48.jpg',
  'robot_picture/62_Sophia.jpg',
  'robot_picture/63_Igus.jpg',
  'robot_picture/64_Cosero.jpg',
  'robot_picture/65_Flobi.jpg',
  'robot_picture/66_TJ-Bot.jpg',
  'robot_picture/67_DURUS.jpg',
  'robot_picture/68_SociBot-mini.jpg',
  'robot_picture/69_SociBot-Kiosk.jpg',
  'robot_picture/70_Cozmo.jpg',
  'robot_picture/71_GoCart.jpg',
  'robot_picture/72_Jimmy.jpg',
  'robot_picture/73_HRP-2VZ.jpg',
  'robot_picture/74_Kuri.jpg',
  'robot_picture/75_Big-i.jpg',
  'robot_picture/76_murata-girl.jpg',
  'robot_picture/77_TALOS.jpg',
  'robot_picture/78_TIAGo.jpg',
  'robot_picture/79_REEM.jpg',
  'robot_picture/80_REEM-C-2.jpg',
  'robot_picture/81_Robovie-mR2.jpg',
  'robot_picture/82_Franka-Emika.jpg',
  'robot_picture/83_Sawyer.jpg',
  'robot_picture/84_hub.jpg',
  'robot_picture/85_Mykie.jpg',
  'robot_picture/86_Talk-Torque.jpg',
  'robot_picture/87_Animated-SmartPhone-1.jpg',
  'robot_picture/88_manoi-pf01.jpg',
  'robot_picture/89_Gemini.jpg',
  'robot_picture/90_manoi-AT01.jpg',
  'robot_picture/91_HRP-4.jpg',
  'robot_picture/92_Kobian-1.jpg',
  'robot_picture/93_Hitachi-Emiew.jpg',
  'robot_picture/94_MILLENNIA.jpg',
  'robot_picture/95_JD-Humanoid.jpg',
  'robot_picture/96_Felix.jpg',
  'robot_picture/97_Flash.jpg',
  'robot_picture/98_Personal-Robot.jpg',
  'robot_picture/99_AnyBot.jpg',
  'robot_picture/100_H5.jpg',
  'robot_picture/301_H1.jpg',
  'robot_picture/302_G1.jpg',
  'robot_picture/303_Protoclon.jpg',
  'robot_picture/304_Spot.jpg',
  'robot_picture/305_Optimus.jpg',
  'robot_picture/306_Ameca.jpg',
  'robot_picture/307_EVE.jpg',
  'robot_picture/308_GR-1.jpg',
  'robot_picture/310_Digit-2.jpg',
  'robot_picture/311_SE01.jpg',
  'robot_picture/313_SA01.jpg',
  'robot_picture/314_s2.jpg',
  'robot_picture/315_N1.jpg',
  'robot_picture/316_X1.jpg',
  'robot_picture/317_Go2.jpg',
  'robot_picture/318_Surena IV.jpg',
  'robot_picture/321_NEO Gamma.jpg',
  'robot_picture/325_RT-G.jpg',
  'robot_picture/326_NICOL.jpg',
  'robot_picture/327_Berkeley Humanoid Lite.jpg',
  'robot_picture/328_Emo.jpg',
  'robot_picture/330_BDX  Droid.jpg',
  'robot_picture/331_Vector.jpg',
  'robot_picture/332_Emo the robotic head.jpg',
  'robot_picture/333_Booster T1.jpg',
  'robot_picture/334_Qmini.jpg',
  'robot_picture/335_ToddlerBot.jpg',
  'robot_picture/336_Yonbo.jpg',
  'robot_picture/337_Chipo.jpg',
  'robot_picture/338_Creature_02.jpg',
  'robot_picture/339_Bambot.jpg',
  'robot_picture/340_Mirokaï.jpg',
  'robot_picture/341_Tang Monk.jpg',
  'robot_picture/342_XGO_tiny.jpg',
  'robot_picture/343_Lovot 3.jpg',
  'robot_picture/344_Mi-mo.jpg',
  'robot_picture/345_Tidybot++.jpg',
  'robot_picture/346_Aru.jpg',
  'robot_picture/347_AIBI.jpg',
  'robot_picture/348_Ballie.jpg',
  'robot_picture/349_XGO-Rider.jpg',
  'robot_picture/350_Ascento.jpg',
  'robot_picture/351_Nicobo.jpg',
  'robot_picture/352_mini talking-bones.jpg',
  'robot_picture/353_AYUDA-MiraMe.jpg',
  'robot_picture/354_aibo.jpg',
  'robot_picture/355_bocco emo.jpg',
  'robot_picture/356_Ropet.jpg',
  'robot_picture/357_DJI Neo.jpg',
  'robot_picture/101_HOSPI-Rimo.jpg',
  'robot_picture/102_Nextage.jpg',
  'robot_picture/103_DRU.jpg',
  'robot_picture/104_S-one.jpg',
  'robot_picture/105_Surena-III.jpg',
  'robot_picture/106_AcYut-7.jpg',
  'robot_picture/107_Aila.jpg',
  'robot_picture/108_Ami.jpg',
  'robot_picture/109_MoRO.jpg',
  'robot_picture/110_Ewya.jpg',
  'robot_picture/111_5e-Nanny-Bot.jpg',
  'robot_picture/112_Leka.jpg',
  'robot_picture/113_Cuti.jpg',
  'robot_picture/114_Heasy.jpg',
  'robot_picture/115_Yumi-TrueSmart.jpg',
  'robot_picture/116_Tapia.jpg',
  'robot_picture/117_Posy.jpg',
  'robot_picture/118_Furo-S.jpg',
  'robot_picture/119_Furo-i-Home.jpg',
  'robot_picture/120_Jimmy.jpg',
  'robot_picture/121_Mung.jpg',
  'robot_picture/122_Mabu.jpg',
  'robot_picture/123_Mitra.jpg',
  'robot_picture/124_quori.jpg',
  'robot_picture/125_Babyloid.jpg',
  'robot_picture/126_Ira.jpg',
  'robot_picture/127_Cassie.jpg',
  'robot_picture/128_R3-1.jpg',
  'robot_picture/129_Troy2.jpg',
  'robot_picture/130_Bandit.jpg',
  'robot_picture/131_sparki.jpg',
  'robot_picture/132_Maki.jpg',
  'robot_picture/133_HomeMate.jpg',
  'robot_picture/134_eyePi.jpg',
  'robot_picture/135_reeti.jpg',
  'robot_picture/136_Hitchbot.jpg',
  'robot_picture/137_Roboware-E3.jpg',
  'robot_picture/138_Reddy.jpg',
  'robot_picture/139_Autom.jpg',
  'robot_picture/140_Snackbot.jpg',
  'robot_picture/141_Amigo.jpg',
  'robot_picture/142_Hermes.jpg',
  'robot_picture/143_ARMAR-3.jpg',
  'robot_picture/144_loomo.jpg',
  'robot_picture/145_Eva.jpg',
  'robot_picture/146_Robohon.jpg',
  'robot_picture/147_Meka-1.jpg',
  'robot_picture/148_Cody.jpg',
  'robot_picture/149_TellUBee.jpg',
  'robot_picture/150_Milo.jpg',
  'robot_picture/151_Topio-Dio.jpg',
  'robot_picture/152_Twendy-One.jpg',
  'robot_picture/153_Wakamaru.jpg',
  'robot_picture/154_HERB.jpg',
  'robot_picture/155_E-Nuvo.jpg',
  'robot_picture/156_Robina.jpg',
  'robot_picture/157_Humanoid-2.jpg',
  'robot_picture/158_Mahru.jpg',
  'robot_picture/159_Manav.jpg',
  'robot_picture/160_musio.jpg',
  'robot_picture/161_Roboy.jpg',
  'robot_picture/162_Hoap-3.jpg',
  'robot_picture/163_Rolling-Justin.jpg',
  'robot_picture/164_Aido-1.jpg',
  'robot_picture/165_Roboray.jpg',
  'robot_picture/166_Ciros.jpg',
  'robot_picture/167_Kibo.jpg',
  'robot_picture/168_Silbot-3.jpg',
  'robot_picture/169_Sociable-Trashbox.jpg',
  'robot_picture/170_Ethon2.jpg',
  'robot_picture/171_Mero.jpg',
  'robot_picture/172_qihan-sanbot.jpg',
  'robot_picture/173_UR3.jpg',
  'robot_picture/174_PadBot.jpg',
  'robot_picture/175_Luna.jpg',
  'robot_picture/176_sphero.jpg',
  'robot_picture/177_Ollie.jpg',
  'robot_picture/178_Meccano-MeccaNoid.jpg',
  'robot_picture/179_tipron.jpg',
  'robot_picture/180_Lego-boost.jpg',
  'robot_picture/181_Keecker.jpg',
  'robot_picture/182_Clocky.jpg',
  'robot_picture/183_ARM-S.jpg',
  'robot_picture/184_Aero-Drc.jpg',
  'robot_picture/185_HRP2+.jpg',
  'robot_picture/186_Metal-Rebel.jpg',
  'robot_picture/187_THOR.jpg',
  'robot_picture/188_DRC-Hubo.jpg',
  'robot_picture/189_Xing-Tian.jpg',
  'robot_picture/190_Running-Man.jpg',
  'robot_picture/191_HRP2-Promet.jpg',
  'robot_picture/192_Johnny-Five.jpg',
  'robot_picture/193_Walk-Man.jpg',
  'robot_picture/194_Escher.jpg',
  'robot_picture/195_Kodomoroid.jpg',
  'robot_picture/196_Ontonaroid.jpg',
  'robot_picture/197_Erica.jpg',
  'robot_picture/198_Geminoid-H1-4.jpg',
  'robot_picture/199_Int-Ball.jpg',
  'robot_picture/200_Surena-Mini.jpg',
  'robot_picture/201_pris.jpg',
  'robot_picture/202_speech_buddy.jpg',
  'robot_picture/203_geebot.jpg',
  'robot_picture/204_chico.jpg',
  'robot_picture/205_kaspar.jpg',
  'robot_picture/206_pillo.jpg',
  'robot_picture/207_otto.jpg',
  'robot_picture/208_ipal.jpg',
  'robot_picture/209_commu.jpg',
  'robot_picture/210_platina.jpg',
  'robot_picture/211_Ibuki.jpg',
  'robot_picture/212_synchy.jpg',
  'robot_picture/213_slate.jpg',
  'robot_picture/214_qtrobot.jpg',
  'robot_picture/215_av1.jpg',
  'robot_picture/216_hsrmobile.jpg',
  'robot_picture/217_thr3.jpg',
  'robot_picture/218_topo.jpg',
  'robot_picture/219_misty.jpg',
  'robot_picture/220_aerialbipedal.jpg',
  'robot_picture/221_haru.jpg',
  'robot_picture/222_toro.jpg',
  'robot_picture/223_moxi.jpg',
  'robot_picture/224_waseda.jpg',
  'robot_picture/225_telexistence.jpg',
  'robot_picture/226_edgar.jpg',
  'robot_picture/227_airbot.jpg',
  'robot_picture/228_kengoro.jpg',
  'robot_picture/229_myon.jpg',
  'robot_picture/230_centaur.jpg',
  'robot_picture/231_3e_a18.jpg',
  'robot_picture/232_3e_c18.jpg',
  'robot_picture/233_aeolus.jpg',
  'robot_picture/234_walker.jpg',
  'robot_picture/235_lynx.jpg',
  'robot_picture/236_cruzr.jpg',
  'robot_picture/237_sanbot_max.jpg',
  'robot_picture/238_sanbot_nano.jpg',
  'robot_picture/239_nadine.jpg',
  'robot_picture/240_padbot3.jpg',
  'robot_picture/241_stevie.jpg',
  'robot_picture/242_gazeroid.jpg',
  'robot_picture/243_jackrabbit2.jpg',
  'robot_picture/244_seer.jpg',
  'robot_picture/245_yumi.jpg',
  'robot_picture/246_adata.jpg',
  'robot_picture/247_careobot.jpg',
  'robot_picture/248_charli.jpg',
  'robot_picture/249_ibotn.jpg',
  'robot_picture/250_kojiro.jpg',
  'robot_picture/251_olivia.jpg',
];

const canvas = document.getElementById('abot-canvas');
const ctx = canvas.getContext('2d');

// Set fullscreen canvas
function resizeCanvas() {
  CANVAS_WIDTH = window.innerWidth;
  CANVAS_HEIGHT = window.innerHeight;
  FONT_SIZE = Math.min(CANVAS_WIDTH, CANVAS_HEIGHT) * 0.35; // Larger font
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Global variables for mouse interaction
let globalDots = [];
let mouseX = 0;
let mouseY = 0;
let isMouseOverCanvas = false;
let animationCompleted = false; // Track if animation is completed
let clickHandlerAdded = false; // Prevent duplicate click event addition
let interactiveLoopRunning = false; // Control interactive loop

// Add mouse event listeners
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
  isMouseOverCanvas = true;

  // Check if mouse is hovering over any image
  globalDots.forEach(dot => {
    const distance = Math.sqrt((mouseX - dot.to.x - DOT_SIZE/2) ** 2 + (mouseY - dot.to.y - DOT_SIZE/2) ** 2);
    const wasHovered = dot.isHovered;
    dot.isHovered = distance < DOT_SIZE;

    // If hover state changed, trigger animation
    if (dot.isHovered && !wasHovered) {
      animateHover(dot, true);
    } else if (!dot.isHovered && wasHovered) {
      animateHover(dot, false);
    }
  });
});

canvas.addEventListener('mouseleave', () => {
  isMouseOverCanvas = false;
  // Reset all hover effects
  globalDots.forEach(dot => {
    if (dot.isHovered) {
      dot.isHovered = false;
      animateHover(dot, false);
    }
  });
});

// Hover animation function
function animateHover(dot, isHovering) {
  const targetScale = isHovering ? 1.5 : 1;
  const targetOpacity = isHovering ? 0.8 : 1;
  const duration = 200; // Animation duration
  const startTime = performance.now();
  const startScale = dot.hoverScale;
  const startOpacity = dot.hoverOpacity;

  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Use easing function
    const easeProgress = 1 - Math.pow(1 - progress, 3);

    dot.hoverScale = startScale + (targetScale - startScale) * easeProgress;
    dot.hoverOpacity = startOpacity + (targetOpacity - startOpacity) * easeProgress;

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  requestAnimationFrame(animate);
}

// 1. First render text shape with font, get pixel points
function getTextPixels(text, fontSize) {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = CANVAS_WIDTH;
  tempCanvas.height = CANVAS_HEIGHT;
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Use thickest font for clearer effect
  tempCtx.font = `900 ${fontSize}px 'Arial Black', 'Impact', 'Helvetica', sans-serif`;
  tempCtx.textAlign = 'center';
  tempCtx.textBaseline = 'middle';
  tempCtx.fillStyle = '#fff';

  // Thicker multi-layer stroke to increase font thickness
  tempCtx.strokeStyle = '#fff';
  tempCtx.lineWidth = 12;
  tempCtx.strokeText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  tempCtx.lineWidth = 10;
  tempCtx.strokeText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  tempCtx.lineWidth = 8;
  tempCtx.strokeText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  tempCtx.lineWidth = 6;
  tempCtx.strokeText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  tempCtx.fillText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

  const imageData = tempCtx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  const pixels = [];

  // Denser sampling for better text shape effect
  for (let y = 0; y < CANVAS_HEIGHT; y += DOT_SIZE + DOT_GAP) {
    for (let x = 0; x < CANVAS_WIDTH; x += DOT_SIZE + DOT_GAP) {
      const idx = (y * CANVAS_WIDTH + x) * 4;
      if (imageData.data[idx + 3] > 30) { // Lower threshold for more pixel points
        pixels.push({ x, y });
      }
    }
  }
  return pixels;
}

// 2. Load and preprocess images
function loadImages(list) {
  let loadedCount = 0;

  return Promise.all(list.map((src) => {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;

        // Preprocess images to off-screen Canvas for better rendering performance
        const canvas = document.createElement('canvas');
        canvas.width = DOT_SIZE;
        canvas.height = DOT_SIZE;
        const ctx = canvas.getContext('2d');

        // Draw image to fixed size Canvas
        ctx.drawImage(img, 0, 0, DOT_SIZE, DOT_SIZE);

        resolve(canvas);
      };
      img.onerror = () => {
        resolve(null);
      };
      img.src = src;
    });
  })).then(imgs => {
    const validImages = imgs.filter(Boolean);
    return validImages;
  });
}

// 3. Generate letter animation from left to right
function animateMosaic(pixels, images, onComplete = null) {
  // Immediately reset animation completion status and stop interactive loop
  animationCompleted = false;
  interactiveLoopRunning = false; // Stop interactive loop

  // Hide navigation tabs
  hideNavigationTabs();

  // Shuffle image array to avoid repetition
  const shuffledImages = [...images].sort(() => Math.random() - 0.5);
  const imgCount = shuffledImages.length;

  // Sort pixels by X coordinate to achieve left-to-right effect
  const sortedPixels = [...pixels].sort((a, b) => a.x - b.x);

  // Group pixels into different letters
  const letterGroups = [];
  const groupSize = Math.ceil(sortedPixels.length / 7); // Roughly divide into 7 groups for "ABOT 2.0"

  for (let i = 0; i < 7; i++) {
    const start = i * groupSize;
    const end = Math.min((i + 1) * groupSize, sortedPixels.length);
    letterGroups.push(sortedPixels.slice(start, end));
  }

  const dots = [];
  let imageIndex = 0; // Used to ensure no image repetition

  // Create animation points for each letter group
  letterGroups.forEach((group, letterIndex) => {
    group.forEach((p) => {
      // Randomly select starting position from four edges
      const edge = Math.floor(Math.random() * 4);
      let sx, sy;
      const margin = 300;

      if (edge === 0) { // Top edge
        sx = Math.random() * CANVAS_WIDTH;
        sy = -margin;
      } else if (edge === 1) { // Right edge
        sx = CANVAS_WIDTH + margin;
        sy = Math.random() * CANVAS_HEIGHT;
      } else if (edge === 2) { // Bottom edge
        sx = Math.random() * CANVAS_WIDTH;
        sy = CANVAS_HEIGHT + margin;
      } else { // Left edge
        sx = -margin;
        sy = Math.random() * CANVAS_HEIGHT;
      }

      // Calculate delay: each letter delays 300ms, random delay within letter
      const letterDelay = letterIndex * 300; // Inter-letter delay
      const pixelDelay = Math.random() * 200; // Random delay within letter

      // Ensure images are not repeated, if used up, start again
      const currentImg = shuffledImages[imageIndex % imgCount];
      imageIndex++;

      dots.push({
        img: currentImg,
        from: { x: sx, y: sy },
        to: p,
        delay: letterDelay + pixelDelay,
        letterIndex: letterIndex,
        isHovered: false,
        hoverScale: 1,
        hoverOpacity: 1
      });
    });
  });

  // Save to global variable for mouse interaction
  globalDots = dots;

  const start = performance.now();
  let lastFrameTime = start;
  let navigationShown = false; // Track if navigation tabs are shown

  // Immediately set animation incomplete status

  function draw(now) {
    // Limit frame rate to improve performance
    const deltaTime = now - lastFrameTime;
    if (deltaTime < 16.67) { // Limit to 60FPS
      requestAnimationFrame(draw);
      return;
    }
    lastFrameTime = now;

    // Clear canvas, maintain transparent background to show glass blur effect
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const t = now - start;

    // Check if all dots have completed animation
    let allDotsCompleted = true;

    dots.forEach(dot => {
      let progress = Math.min(1, Math.max(0, (t - dot.delay) / ANIMATION_DURATION));
      if (progress <= 0) {
        allDotsCompleted = false;
        return;
      }

      // If this dot hasn't completed animation, mark as incomplete
      if (progress < 1) {
        allDotsCompleted = false;
      }

      // Slow-fast-slow speed effect - ease-in-out
      let easeProgress;
      if (progress < 0.5) {
        // First half: slow to fast (ease-in)
        easeProgress = 2 * progress * progress;
      } else {
        // Second half: fast to slow (ease-out)
        easeProgress = 1 - 2 * (1 - progress) * (1 - progress);
      }

      // Straight path, no curves added
      const x = dot.from.x + (dot.to.x - dot.from.x) * easeProgress;
      const y = dot.from.y + (dot.to.y - dot.from.y) * easeProgress;

      // Apply hover effects
      const currentSize = DOT_SIZE * (dot.hoverScale || 1);
      const offsetX = (currentSize - DOT_SIZE) / 2;
      const offsetY = (currentSize - DOT_SIZE) / 2;

      ctx.save();
      ctx.globalAlpha = dot.hoverOpacity || 1;

      // If hovering, add enhanced glow effect
      if (dot.isHovered) {
        ctx.shadowColor = 'rgba(0, 200, 255, 1)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Add outer glow
        ctx.save();
        ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
        ctx.shadowBlur = 25;
        ctx.fillStyle = 'rgba(0, 200, 255, 0.1)';
        ctx.fillRect(Math.round(x - offsetX - 5), Math.round(y - offsetY - 5), currentSize + 10, currentSize + 10);
        ctx.restore();
      }

      // Use preprocessed Canvas for better performance
      ctx.drawImage(dot.img,
        Math.round(x - offsetX), Math.round(y - offsetY), currentSize, currentSize
      );

      ctx.restore();
    });

    // If all dots completed animation and navigation tabs not shown yet, show navigation tabs
    if (allDotsCompleted && !navigationShown) {
      navigationShown = true;
      showNavigationTabs();
    }

    if (t < ANIMATION_DURATION + 6 * 300 + STAGGER_DELAY + 500) { // 6 letter intervals + animation duration + buffer
      requestAnimationFrame(draw);
    } else {
      // Final freeze - high performance rendering
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw final state, support hover effects
      dots.forEach(dot => {
        const currentSize = DOT_SIZE * (dot.hoverScale || 1);
        const offsetX = (currentSize - DOT_SIZE) / 2;
        const offsetY = (currentSize - DOT_SIZE) / 2;

        ctx.save();
        ctx.globalAlpha = dot.hoverOpacity || 1;

        // If hovering, add enhanced glow effect
        if (dot.isHovered) {
          ctx.shadowColor = 'rgba(0, 200, 255, 1)';
          ctx.shadowBlur = 15;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;

          // Add outer glow
          ctx.save();
          ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
          ctx.shadowBlur = 25;
          ctx.fillStyle = 'rgba(0, 200, 255, 0.1)';
          ctx.fillRect(Math.round(dot.to.x - offsetX - 5), Math.round(dot.to.y - offsetY - 5), currentSize + 10, currentSize + 10);
          ctx.restore();
        }

        ctx.drawImage(dot.img,
          Math.round(dot.to.x - offsetX), Math.round(dot.to.y - offsetY), currentSize, currentSize
        );

        ctx.restore();
      });

      // Call completion callback
      if (onComplete) {
        setTimeout(onComplete, 300);
      }

      // Continue redrawing after animation completion to support interactive effects
      animationCompleted = true; // Mark animation complete
      startInteractiveLoop();
    }
  }
  requestAnimationFrame(draw);
}

// Interactive redraw loop
function startInteractiveLoop() {
  if (interactiveLoopRunning) {
    return;
  }

  interactiveLoopRunning = true;

  function interactiveDraw() {
    if (!interactiveLoopRunning) {
      return;
    }

    // Clear canvas, maintain transparent background
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw all images, support hover effects
    globalDots.forEach(dot => {
      const currentSize = DOT_SIZE * (dot.hoverScale || 1);
      const offsetX = (currentSize - DOT_SIZE) / 2;
      const offsetY = (currentSize - DOT_SIZE) / 2;

      ctx.save();
      ctx.globalAlpha = dot.hoverOpacity || 1;

      // If hovering, add enhanced glow effect
      if (dot.isHovered) {
        ctx.shadowColor = 'rgba(0, 200, 255, 1)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Add outer glow
        ctx.save();
        ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
        ctx.shadowBlur = 25;
        ctx.fillStyle = 'rgba(0, 200, 255, 0.1)';
        ctx.fillRect(Math.round(dot.to.x - offsetX - 5), Math.round(dot.to.y - offsetY - 5), currentSize + 10, currentSize + 10);
        ctx.restore();
      }

      ctx.drawImage(dot.img,
        Math.round(dot.to.x - offsetX), Math.round(dot.to.y - offsetY), currentSize, currentSize
      );

      ctx.restore();
    });

    requestAnimationFrame(interactiveDraw);
  }

  requestAnimationFrame(interactiveDraw);
}

// Pixel-style loading animation
let loadingStartTime = 0;

function showLoadingProgress(current, total) {
  if (!loadingStartTime) loadingStartTime = performance.now();
  const elapsed = performance.now() - loadingStartTime;

  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Dynamic background grid effect
  drawPixelGrid(elapsed, 1);

  // Main title - ABOT 2.0 (using more distinctive font)
  drawRetroPixelText('ABOT 2.0', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 100,
    Math.min(CANVAS_WIDTH, CANVAS_HEIGHT) * 0.08, '#00ff88', elapsed);

  // Simplified loading text
  const progress = Math.floor((current / total) * 100);
  const loadingText = 'LOADING';

  drawRetroPixelText(loadingText, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30,
    Math.min(CANVAS_WIDTH, CANVAS_HEIGHT) * 0.03, '#ffffff', elapsed);

  // Pixel-style progress bar (new style)
  drawRetroProgressBar(current, total, elapsed);

  // Progress percentage (moved down)
  drawRetroPixelText(`${progress}%`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 80,
    Math.min(CANVAS_WIDTH, CANVAS_HEIGHT) * 0.04, '#00ff88', elapsed);
}

// Draw retro pixel-style text (using Press Start 2P font)
function drawRetroPixelText(text, x, y, size, color, time) {
  ctx.save();

  // Use Press Start 2P pixel font
  ctx.font = `${size}px 'Press Start 2P', 'Consolas', 'Monaco', 'Courier New', monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Strong glow effect
  const glowIntensity = 0.8 + 0.4 * Math.sin(time * 0.005);
  ctx.shadowColor = color;
  ctx.shadowBlur = size * 0.15 * glowIntensity;

  // Double stroke effect
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, size * 0.02);
  ctx.strokeText(text, x, y);

  // Main text
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);

  // Inner glow effect
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = size * 0.05;
  ctx.fillText(text, x, y);

  // Random flicker effect
  if (Math.random() < 0.1) {
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.3;
    ctx.fillText(text, x, y);
  }

  ctx.restore();
}

// Keep original function for other uses
function drawPixelText(text, x, y, size, color, time) {
  ctx.save();

  // Pixel-style font effect
  ctx.font = `${size}px 'Courier New', monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Glow effect
  const glowIntensity = 0.5 + 0.3 * Math.sin(time * 0.003);
  ctx.shadowColor = color;
  ctx.shadowBlur = size * 0.1 * glowIntensity;

  // Main text
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);

  // Scan line effect
  if (Math.floor(time / 100) % 20 < 10) {
    ctx.fillStyle = `${color}40`;
    ctx.fillRect(x - text.length * size * 0.3, y - size * 0.6, text.length * size * 0.6, 2);
  }

  ctx.restore();
}

// Draw retro pixel-style progress bar (new style)
function drawRetroProgressBar(current, total, time) {
  const progress = current / total;

  // Progress bar dimensions
  const barWidth = Math.min(400, CANVAS_WIDTH * 0.6);
  const barHeight = 30;
  const barX = (CANVAS_WIDTH - barWidth) / 2;
  const barY = CANVAS_HEIGHT / 2 + 10;

  // Block count and size
  const blockCount = 20;
  const blockWidth = (barWidth - (blockCount - 1) * 2) / blockCount; // 2px spacing
  const filledBlocks = Math.floor(progress * blockCount);

  ctx.save();

  // Draw outer border
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 3;
  ctx.strokeRect(barX - 3, barY - 3, barWidth + 6, barHeight + 6);

  // Draw inner border
  ctx.strokeStyle = '#004422';
  ctx.lineWidth = 1;
  ctx.strokeRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);

  // Draw background
  ctx.fillStyle = '#000011';
  ctx.fillRect(barX, barY, barWidth, barHeight);

  // Draw progress blocks
  for (let i = 0; i < blockCount; i++) {
    const blockX = barX + i * (blockWidth + 2);

    if (i < filledBlocks) {
      // Filled blocks
      const intensity = 0.8 + 0.2 * Math.sin(time * 0.01 + i * 0.3);

      // Block glow effect
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 8;

      // Uniform green color
      ctx.fillStyle = '#00ff88';
      ctx.fillRect(blockX, barY + 2, blockWidth, barHeight - 4);

      // Inner highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(blockX, barY + 2, blockWidth, 4);

    } else if (i === filledBlocks && progress * blockCount > filledBlocks) {
      // Currently filling block (partial fill)
      const partialProgress = (progress * blockCount) - filledBlocks;
      const partialWidth = blockWidth * partialProgress;

      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 6;
      ctx.fillStyle = '#00ff88';
      ctx.fillRect(blockX, barY + 2, partialWidth, barHeight - 4);

      // Flicker effect
      if (Math.sin(time * 0.02) > 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(blockX, barY + 2, partialWidth, barHeight - 4);
      }
    } else {
      // Empty blocks
      ctx.fillStyle = '#002211';
      ctx.fillRect(blockX, barY + 2, blockWidth, barHeight - 4);

      // Border
      ctx.strokeStyle = '#004422';
      ctx.lineWidth = 1;
      ctx.strokeRect(blockX, barY + 2, blockWidth, barHeight - 4);
    }
  }

  // Scan line effect
  const scanX = barX + (time * 0.2) % barWidth;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fillRect(scanX, barY, 2, barHeight);

  ctx.restore();
}

// Keep original progress bar function
function drawPixelProgressBar(current, total, time) {
  const barWidth = Math.min(500, CANVAS_WIDTH * 0.7);
  const barHeight = 20;
  const barX = (CANVAS_WIDTH - barWidth) / 2;
  const barY = CANVAS_HEIGHT / 2 + 30;

  ctx.save();

  // Outer border - pixel style
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 2;
  ctx.strokeRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);

  // Inner background
  ctx.fillStyle = '#001122';
  ctx.fillRect(barX, barY, barWidth, barHeight);

  // Progress fill
  const progress = current / total;
  const fillWidth = barWidth * progress;

  // Gradient fill
  const gradient = ctx.createLinearGradient(barX, barY, barX + fillWidth, barY);
  gradient.addColorStop(0, '#00ff88');
  gradient.addColorStop(0.5, '#00ddff');
  gradient.addColorStop(1, '#0088ff');

  ctx.fillStyle = gradient;
  ctx.fillRect(barX, barY, fillWidth, barHeight);

  // Pixelated effect - small blocks
  const blockSize = 4;
  const blocks = Math.floor(fillWidth / blockSize);

  for (let i = 0; i < blocks; i++) {
    const blockX = barX + i * blockSize;
    const alpha = 0.3 + 0.7 * Math.sin(time * 0.01 + i * 0.5);

    ctx.fillStyle = `rgba(0, 255, 136, ${alpha})`;
    ctx.fillRect(blockX, barY, blockSize - 1, barHeight);
  }

  // Scan line animation
  const scanX = barX + (time * 0.3) % barWidth;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fillRect(scanX, barY, 2, barHeight);

  ctx.restore();
}

// Draw background grid
function drawPixelGrid(time) {
  ctx.save();

  const gridSize = 40;
  const offsetX = (time * 0.02) % gridSize;
  const offsetY = (time * 0.015) % gridSize;

  ctx.strokeStyle = 'rgba(0, 255, 136, 0.1)';
  ctx.lineWidth = 1;

  // Vertical lines
  for (let x = -offsetX; x < CANVAS_WIDTH + gridSize; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, CANVAS_HEIGHT);
    ctx.stroke();
  }

  // Horizontal lines
  for (let y = -offsetY; y < CANVAS_HEIGHT + gridSize; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_WIDTH, y);
    ctx.stroke();
  }

  // Random flickering dots
  for (let i = 0; i < 20; i++) {
    if (Math.random() < 0.1) {
      const x = Math.random() * CANVAS_WIDTH;
      const y = Math.random() * CANVAS_HEIGHT;
      const alpha = Math.random() * 0.5;

      ctx.fillStyle = `rgba(0, 255, 136, ${alpha})`;
      ctx.fillRect(x, y, 2, 2);
    }
  }

  ctx.restore();
}

// Show loading complete animation
function showLoadingComplete() {
  return new Promise(resolve => {
    const startTime = performance.now();
    const duration = 1000; // 1 second completion animation

    function animate(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Background grid fade out
      drawPixelGrid(elapsed, 1 - progress);

      // "LOADING COMPLETE" text
      const alpha = Math.sin(progress * Math.PI);
      drawRetroPixelText('LOADING COMPLETE', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40,
        Math.min(CANVAS_WIDTH, CANVAS_HEIGHT) * 0.035, `rgba(0, 255, 136, ${alpha})`, elapsed);

      // "INITIALIZING ABOT 2.0" text
      if (progress > 0.5) {
        const alpha2 = (progress - 0.5) * 2;
        drawRetroPixelText('INITIALIZING ABOT 2.0', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20,
          Math.min(CANVAS_WIDTH, CANVAS_HEIGHT) * 0.025, `rgba(0, 221, 255, ${alpha2})`, elapsed);
      }

      // Scan line effect
      const scanY = CANVAS_HEIGHT * progress;
      ctx.fillStyle = 'rgba(0, 255, 136, 0.3)';
      ctx.fillRect(0, scanY - 2, CANVAS_WIDTH, 4);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Final clear
        setTimeout(() => {
          ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          resolve();
        }, 200);
      }
    }

    requestAnimationFrame(animate);
  });
}

// Show all UI elements - smooth animation
function showNavigationTabs() {
  const nav = document.querySelector('.top-nav');
  const codedBy = document.querySelector('.coded-by');
  const paperInfo = document.querySelector('.paper-info');
  const clock = document.querySelector('.clock');
  const version = document.querySelector('.version');

  // Show all elements
  [nav, codedBy, paperInfo, clock, version].forEach(element => {
    if (element) {
      element.style.display = element === nav ? 'flex' : 'block';
      element.style.opacity = '0';
      element.style.transform = 'translateY(-20px) scale(0.8)';
      element.style.filter = 'blur(5px)';
    }
  });

  if (nav) {
    nav.style.display = 'flex';
    nav.style.opacity = '0';
    nav.style.transform = 'translateY(-20px) scale(0.8)';
    nav.style.filter = 'blur(5px)';

    // Get all navigation items
    const navItems = nav.querySelectorAll('.nav-item');
    navItems.forEach((item, index) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(-30px) scale(0.7)';
      item.style.filter = 'blur(8px)';
    });

    // Smooth fade in and move animation
    let progress = 0;
    const duration = 800; // Animation duration
    const startTime = performance.now();

    const animate = (currentTime) => {
      progress = Math.min(1, (currentTime - startTime) / duration);

      // Use easing function (ease-out-cubic)
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      // Basic animation for all UI elements
      [nav, codedBy, paperInfo, clock, version].forEach((element, elementIndex) => {
        if (element) {
          const elementDelay = elementIndex * 150; // Staggered display
          const elementProgress = Math.max(0, Math.min(1, (progress * duration - elementDelay) / (duration - elementDelay)));
          const elementEase = 1 - Math.pow(1 - elementProgress, 3);

          if (elementProgress > 0) {
            element.style.opacity = elementEase;
            element.style.transform = `translateY(${-20 * (1 - elementEase)}px) scale(${0.8 + 0.2 * elementEase})`;
            element.style.filter = `blur(${5 * (1 - elementEase)}px)`;
          }
        }
      });

      // Show navigation items one by one (staggered animation)
      navItems.forEach((item, index) => {
        const itemDelay = index * 100; // Each item delayed by 100ms
        const itemProgress = Math.max(0, Math.min(1, (progress * duration - itemDelay) / (duration - itemDelay)));
        const itemEase = 1 - Math.pow(1 - itemProgress, 3);

        if (itemProgress > 0) {
          item.style.opacity = itemEase;
          item.style.transform = `translateY(${-30 * (1 - itemEase)}px) scale(${0.7 + 0.3 * itemEase})`;
          item.style.filter = `blur(${8 * (1 - itemEase)}px)`;
        }
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animation complete, clean up styles
        nav.style.transform = '';
        nav.style.filter = '';
        navItems.forEach(item => {
          item.style.transform = '';
          item.style.filter = '';
        });
      }
    };

    requestAnimationFrame(animate);
  }
}

// Hide all UI elements
function hideNavigationTabs() {
  const nav = document.querySelector('.top-nav');
  const codedBy = document.querySelector('.coded-by');
  const paperInfo = document.querySelector('.paper-info');
  const clock = document.querySelector('.clock');
  const version = document.querySelector('.version');

  [nav, codedBy, paperInfo, clock, version].forEach(element => {
    if (element) {
      element.style.display = 'none';
    }
  });
}

// Modified background grid function to support transparency
function drawPixelGrid(time, alpha = 1) {
  ctx.save();

  const gridSize = 40;
  const offsetX = (time * 0.02) % gridSize;
  const offsetY = (time * 0.015) % gridSize;

  ctx.strokeStyle = `rgba(0, 255, 136, ${0.1 * alpha})`;
  ctx.lineWidth = 1;

  // Vertical lines
  for (let x = -offsetX; x < CANVAS_WIDTH + gridSize; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, CANVAS_HEIGHT);
    ctx.stroke();
  }

  // Horizontal lines
  for (let y = -offsetY; y < CANVAS_HEIGHT + gridSize; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_WIDTH, y);
    ctx.stroke();
  }

  // Random flickering dots
  for (let i = 0; i < 20; i++) {
    if (Math.random() < 0.1 * alpha) {
      const x = Math.random() * CANVAS_WIDTH;
      const y = Math.random() * CANVAS_HEIGHT;
      const pointAlpha = Math.random() * 0.5 * alpha;

      ctx.fillStyle = `rgba(0, 255, 136, ${pointAlpha})`;
      ctx.fillRect(x, y, 2, 2);
    }
  }

  ctx.restore();
}

// Optimized image loading function
function loadImagesWithProgress(list) {
  let loadedCount = 0;

  // Show initial loading state
  showLoadingProgress(0, list.length);

  return Promise.all(list.map((src) => {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;

        // Update loading progress
        showLoadingProgress(loadedCount, list.length);

        // Preprocess image to offscreen Canvas for better rendering performance
        const canvas = document.createElement('canvas');
        canvas.width = DOT_SIZE;
        canvas.height = DOT_SIZE;
        const ctx = canvas.getContext('2d');

        // Draw image to fixed size Canvas
        ctx.drawImage(img, 0, 0, DOT_SIZE, DOT_SIZE);

        resolve(canvas);
      };
      img.onerror = () => {
        loadedCount++;
        showLoadingProgress(loadedCount, list.length);
        resolve(null);
      };
      img.src = src;
    });
  })).then(imgs => {
    const validImages = imgs.filter(Boolean);

    // Show completion state
    showLoadingComplete();

    return validImages;
  });
}

// Entry function
(async function main() {
  const pixels = getTextPixels(TEXT, FONT_SIZE);

  // Use progress loading function
  const images = await loadImagesWithProgress(IMAGE_LIST);

  if (images.length === 0) {
    return;
  }

  // Show completion animation
  await showLoadingComplete();

  // Warm up rendering system
  ctx.save();
  ctx.fillStyle = 'transparent';
  ctx.fillRect(0, 0, 1, 1);
  ctx.restore();

  // Start animation
  animateMosaic(pixels, images);

  // Add click event listener only once
  if (!clickHandlerAdded) {
    clickHandlerAdded = true;

    canvas.addEventListener('click', () => {
      // Simple approach: return directly after animation completion, no operations
      if (animationCompleted) {
        return;
      }

      const newPixels = getTextPixels(TEXT, FONT_SIZE);
      animateMosaic(newPixels, images);
    });
  }

  // Add navigation click events
  setupNavigationEvents();
})();

// Image gallery functionality
let currentPage = 1;
let totalPages = 1;
const imagesPerPage = 48; // 8 columns x 6 rows = 48 images
let allRobotImages = [];
let originalRobotImages = []; // Save original order
let paginationInitialized = false; // Prevent duplicate pagination control initialization
let currentSortCategory = 'time'; // Current sort category
let currentSortDirection = 'high'; // Current sort direction

// Initialize image gallery
function initImageGallery() {
  if (allRobotImages.length === 0) {
    // Generate all robot image paths
    generateRobotImageList();
  }

  // Calculate total pages
  totalPages = Math.ceil(allRobotImages.length / imagesPerPage);

  // Display first page
  displayImagesPage(1);

  // Set up pagination and sort controls only on first time
  if (!paginationInitialized) {
    setupPaginationControls();
    setupSortControls();
    setupDownloadControls();
    paginationInitialized = true;
  } else {
    // If already initialized, only update page info
    updatePageInfo();
  }
}

// Generate robot image list
function generateRobotImageList() {
  // Include all robot images, arranged in reverse order by number
  const robotImages = [
    // 300 series (newest)
    '357_DJI Neo.jpg', '356_Ropet.jpg', '355_bocco emo.jpg', '354_aibo.jpg', '353_AYUDA-MiraMe.jpg',
    '352_mini talking-bones.jpg', '351_Nicobo.jpg', '350_Ascento.jpg', '349_XGO-Rider.jpg', '348_Ballie.jpg',
    '347_AIBI.jpg', '346_Aru.jpg', '345_Tidybot++.jpg', '344_Mi-mo.jpg', '343_Lovot 3.jpg',
    '342_XGO_tiny.jpg', '341_Tang Monk.jpg', '340_Mirokaï.jpg', '339_Bambot.jpg', '338_Creature_02.jpg',
    '337_Chipo.jpg', '336_Yonbo.jpg', '335_ToddlerBot.jpg', '334_Qmini.jpg', '333_Booster T1.jpg',
    '332_Emo the robotic head.jpg', '331_Vector.jpg', '330_BDX  Droid.jpg', '328_Emo.jpg', '327_Berkeley Humanoid Lite.jpg',
    '326_NICOL.jpg', '325_RT-G.jpg', '321_NEO Gamma.jpg', '318_Surena IV.jpg', '317_Go2.jpg',
    '316_X1.jpg', '315_N1.jpg', '314_s2.jpg', '313_SA01.jpg', '311_SE01.jpg',
    '310_Digit-2.jpg', '308_GR-1.jpg', '307_EVE.jpg', '306_Ameca.jpg', '305_Optimus.jpg',
    '304_Spot.jpg', '303_Protoclon.jpg', '302_G1.jpg', '301_H1.jpg',

    // 200 series
    '251_olivia.jpg', '250_kojiro.jpg', '249_ibotn.jpg', '248_charli.jpg', '247_careobot.jpg',
    '246_adata.jpg', '245_yumi.jpg', '244_seer.jpg', '243_jackrabbit2.jpg', '242_gazeroid.jpg',
    '241_stevie.jpg', '240_padbot3.jpg', '239_nadine.jpg', '238_sanbot_nano.jpg', '237_sanbot_max.jpg',
    '236_cruzr.jpg', '235_lynx.jpg', '234_walker.jpg', '233_aeolus.jpg', '232_3e_c18.jpg',
    '231_3e_a18.jpg', '230_centaur.jpg', '229_myon.jpg', '228_kengoro.jpg', '227_airbot.jpg',
    '226_edgar.jpg', '225_telexistence.jpg', '224_waseda.jpg', '223_moxi.jpg', '222_toro.jpg',
    '221_haru.jpg', '220_aerialbipedal.jpg', '219_misty.jpg', '218_topo.jpg', '217_thr3.jpg',
    '216_hsrmobile.jpg', '215_av1.jpg', '214_qtrobot.jpg', '213_slate.jpg', '212_synchy.jpg',
    '211_Ibuki.jpg', '210_platina.jpg', '209_commu.jpg', '208_ipal.jpg', '207_otto.jpg',
    '206_pillo.jpg', '205_kaspar.jpg', '204_chico.jpg', '203_geebot.jpg', '202_speech_buddy.jpg',
    '201_pris.jpg', '200_Surena-Mini.jpg',

    // 100-199 series
    '199_Int-Ball.jpg', '198_Geminoid-H1-4.jpg', '197_Erica.jpg', '196_Ontonaroid.jpg', '195_Kodomoroid.jpg',
    '194_Escher.jpg', '193_Walk-Man.jpg', '192_Johnny-Five.jpg', '191_HRP2-Promet.jpg', '190_Running-Man.jpg',
    '189_Xing-Tian.jpg', '188_DRC-Hubo.jpg', '187_THOR.jpg', '186_Metal-Rebel.jpg', '185_HRP2+.jpg',
    '184_Aero-Drc.jpg', '183_ARM-S.jpg', '182_Clocky.jpg', '181_Keecker.jpg', '180_Lego-boost.jpg',
    '179_tipron.jpg', '178_Meccano-MeccaNoid.jpg', '177_Ollie.jpg', '176_sphero.jpg', '175_Luna.jpg',
    '174_PadBot.jpg', '173_UR3.jpg', '172_qihan-sanbot.jpg', '171_Mero.jpg', '170_Ethon2.jpg',
    '169_Sociable-Trashbox.jpg', '168_Silbot-3.jpg', '167_Kibo.jpg', '166_Ciros.jpg', '165_Roboray.jpg',
    '164_Aido-1.jpg', '163_Rolling-Justin.jpg', '162_Hoap-3.jpg', '161_Roboy.jpg', '160_musio.jpg',
    '159_Manav.jpg', '158_Mahru.jpg', '157_Humanoid-2.jpg', '156_Robina.jpg', '155_E-Nuvo.jpg',
    '154_HERB.jpg', '153_Wakamaru.jpg', '152_Twendy-One.jpg', '151_Topio-Dio.jpg', '150_Milo.jpg',
    '149_TellUBee.jpg', '148_Cody.jpg', '147_Meka-1.jpg', '146_Robohon.jpg', '145_Eva.jpg',
    '144_loomo.jpg', '143_ARMAR-3.jpg', '142_Hermes.jpg', '141_Amigo.jpg', '140_Snackbot.jpg',
    '139_Autom.jpg', '138_Reddy.jpg', '137_Roboware-E3.jpg', '136_Hitchbot.jpg', '135_reeti.jpg',
    '134_eyePi.jpg', '133_HomeMate.jpg', '132_Maki.jpg', '131_sparki.jpg', '130_Bandit.jpg',
    '129_Troy2.jpg', '128_R3-1.jpg', '127_Cassie.jpg', '126_Ira.jpg', '125_Babyloid.jpg',
    '124_quori.jpg', '123_Mitra.jpg', '122_Mabu.jpg', '121_Mung.jpg', '120_Jimmy.jpg',
    '119_Furo-i-Home.jpg', '118_Furo-S.jpg', '117_Posy.jpg', '116_Tapia.jpg', '115_Yumi-TrueSmart.jpg',
    '114_Heasy.jpg', '113_Cuti.jpg', '112_Leka.jpg', '111_5e-Nanny-Bot.jpg', '110_Ewya.jpg',
    '109_MoRO.jpg', '108_Ami.jpg', '107_Aila.jpg', '106_AcYut-7.jpg', '105_Surena-III.jpg',
    '104_S-one.jpg', '103_DRU.jpg', '102_Nextage.jpg', '101_HOSPI-Rimo.jpg', '100_H5.jpg',

    // 1-99 series
    '99_AnyBot.jpg', '98_Personal-Robot.jpg', '97_Flash.jpg', '96_Felix.jpg', '95_JD-Humanoid.jpg',
    '94_MILLENNIA.jpg', '93_Hitachi-Emiew.jpg', '92_Kobian-1.jpg', '91_HRP-4.jpg', '90_manoi-AT01.jpg',
    '89_Gemini.jpg', '88_manoi-pf01.jpg', '87_Animated-SmartPhone-1.jpg', '86_Talk-Torque.jpg', '85_Mykie.jpg',
    '84_hub.jpg', '83_Sawyer.jpg', '82_Franka-Emika.jpg', '81_Robovie-mR2.jpg', '80_REEM-C-2.jpg',
    '79_REEM.jpg', '78_TIAGo.jpg', '77_TALOS.jpg', '76_murata-girl.jpg', '75_Big-i.jpg',
    '74_Kuri.jpg', '73_HRP-2VZ.jpg', '72_Jimmy.jpg', '71_GoCart.jpg', '70_Cozmo.jpg',
    '69_SociBot-Kiosk.jpg', '68_SociBot-mini.jpg', '67_DURUS.jpg', '66_TJ-Bot.jpg', '65_Flobi.jpg',
    '64_Cosero.jpg', '63_Igus.jpg', '62_Sophia.jpg', '61_BINA48.jpg', '60_Echo-Plus.jpg',
    '59_Anette.jpg', '58_Genie.jpg', '57_iCub.jpg', '56_papero.jpg', '55_irobi-q.jpg',
    '54_qrio.jpg', '53_emys.jpg', '52_aryan.jpg', '51_robothespian.jpg', '50_maggie.jpg',
    '49_Emuu.jpg', '48_muu.jpg', '47_furhat.jpg', '46_domo.jpg', '45_sota.jpg',
    '44_tico.jpg', '43_iCat.jpg', '42_mip2.jpg', '41_MiRAE.jpg', '40_pr2.jpg',
    '39_hiro.jpg', '38_eccerobot.jpg', '37_mertz.jpg', '36_atlas.jpg', '35_valkyrie.jpg',
    '34_pino.jpg', '33_nexi.jpg', '32_kismet.jpg', '31_inmoov.jpg', '30_discorobo.jpg',
    '29_topio.jpg', '28_telenoid.jpg', '27_poppy.jpg', '26_albert-hubo.jpg', '25_han.jpg',
    '24_zeno.jpg', '23_robonaut.jpg', '22_mobiserv-companion.jpg', '21_darwin-op.jpg', '20_aida-driving-agent.jpg',
    '19_romeo.jpg', '18_aldebaran-pepper.jpg', '17_kirobo.jpg', '16_zenbo.jpg', '15_aimec.jpg',
    '14_altair-ez2.jpg', '13_riba-ii.jpg', '12_baxter-industrial.jpg', '11_nao-humanoid.jpg', '10_asimo-humanoid.jpg',
    '9_buddy.jpg', '8_jibo.jpg', '7_alter-humanoid.jpg', '6_cb2-humanoid.jpg', '5_mini.jpg',
    '4_lego-robot-2.jpg', '3_lego-robot-1.jpg', '2_snap_bot.jpg', '1_jia_jia_robot.jpg'
  ];

  originalRobotImages = robotImages.map((filename, index) => {
    const name = filename.replace(/^\d+_/, '').replace(/\.jpg$/, '').replace(/[-_]/g, ' ').toUpperCase();
    const id = parseInt(filename.match(/^\d+/)[0]);
    return {
      src: `robot_picture/${filename}`,
      name: name,
      id: id,
      isAbotNew: id >= 300 // 300 and above are new additions in ABOT 2.0
    };
  });

  // Default sort by newest (reverse order)
  allRobotImages = [...originalRobotImages];
}

// Display images for specified page
function displayImagesPage(page) {
  const imageGrid = document.getElementById('image-grid');
  const startIndex = (page - 1) * imagesPerPage;
  const endIndex = Math.min(startIndex + imagesPerPage, allRobotImages.length);

  // Clear current content
  imageGrid.innerHTML = '';

  // Add current page images
  for (let i = startIndex; i < endIndex; i++) {
    const imageData = allRobotImages[i];
    const imageItem = createImageItem(imageData);
    imageGrid.appendChild(imageItem);
  }

  // Update page info
  currentPage = page;
  updatePageInfo();
}

// Create image item
function createImageItem(imageData) {
  const item = document.createElement('div');
  item.className = 'robot-image-item';

  const img = document.createElement('img');
  img.src = imageData.src;
  img.alt = imageData.name;
  img.loading = 'lazy';

  const overlay = document.createElement('div');
  overlay.className = 'robot-image-overlay';
  overlay.textContent = imageData.name;

  item.appendChild(img);
  item.appendChild(overlay);

  // Add click event to show details popup
  item.addEventListener('click', () => {
    showRobotDetails(imageData.name);
  });

  return item;
}

// Set up pagination controls
function setupPaginationControls() {
  const paginationControls = document.querySelector('.pagination-controls');

  // Use event delegation, add event listener only once
  paginationControls.addEventListener('click', (e) => {
    if (e.target.id === 'prev-btn' && currentPage > 1) {
      displayImagesPage(currentPage - 1);
    } else if (e.target.id === 'next-btn' && currentPage < totalPages) {
      displayImagesPage(currentPage + 1);
    }
  });

  updatePageInfo();
}

// Name matching function - handle special characters and encoding issues
function findMatchingRobotData(robotName) {
  // Direct match
  if (robotData[robotName]) {
    return robotData[robotName];
  }

  // Try various name variants
  const variants = [
    robotName.replace(/Ï/g, ''), // Remove accent characters
    robotName.replace(/Ï/g, 'I'), // Replace with normal characters
    robotName.replace(/[^\w\s-]/g, ''), // Remove all special characters
  ];

  for (const variant of variants) {
    if (robotData[variant]) {
      return robotData[variant];
    }
  }

  // Fuzzy match - find names containing same keywords
  const firstWord = robotName.split(' ')[0];
  const matchingKey = Object.keys(robotData).find(key =>
    key.includes(firstWord) || firstWord.includes(key.split(' ')[0])
  );

  if (matchingKey) {
    return robotData[matchingKey];
  }

  return null;
}

// Helper function to get robot scores
function getRobotScore(robotName, scoreType) {
  const data = findMatchingRobotData(robotName);
  if (!data) {
    return 0;
  }

  switch (scoreType) {
    case 'perception':
      return data.perception || 0;
    case 'behavior':
      return data.behavior || 0;
    case 'total':
      return data.total || 0;
    default:
      return 0;
  }
}

// Set up sort controls
function setupSortControls() {
  const sortCategory = document.getElementById('sort-category');
  const sortDirection = document.getElementById('sort-direction');

  // Listen for sort category changes
  sortCategory.addEventListener('change', (e) => {
    currentSortCategory = e.target.value;
    updateSortDirectionOptions();
    applySorting();
    displayImagesPage(1); // Redisplay first page
  });

  // Listen for sort direction changes
  sortDirection.addEventListener('change', (e) => {
    currentSortDirection = e.target.value;
    applySorting();
    displayImagesPage(1); // Redisplay first page
  });

  // Initialize sort direction options
  updateSortDirectionOptions();
}

// Update sort direction options
function updateSortDirectionOptions() {
  const sortDirection = document.getElementById('sort-direction');

  // Clear existing options
  sortDirection.innerHTML = '';

  if (currentSortCategory === 'time') {
    sortDirection.innerHTML = `
      <option value="high">NEWEST FIRST</option>
      <option value="low">OLDEST FIRST</option>
    `;
  } else if (currentSortCategory === 'filter') {
    sortDirection.innerHTML = `
      <option value="high">ABOT 2.0</option>
      <option value="low">ABOT</option>
    `;
  } else {
    // For score categories (perception, behavior, total)
    sortDirection.innerHTML = `
      <option value="high">HIGH TO LOW</option>
      <option value="low">LOW TO HIGH</option>
    `;
  }

  // Reset to first option
  currentSortDirection = sortDirection.value;
}



// Set up download controls
function setupDownloadControls() {
  const downloadBtn = document.getElementById('download-btn');

  downloadBtn.addEventListener('click', async () => {
    const downloadType = document.getElementById('download-select').value;
    await handleDownload(downloadType);
  });
}

// Handle download
async function handleDownload(type) {
  if (type === 'images') {
    // Download image archive
    await downloadFile('robot_picture.zip', 'robot_picture.zip');
  } else if (type === 'data') {
    // Download CSV data file
    await downloadFile('robot_rankings_complete_.csv', 'robot_rankings_complete_.csv');
  }
}

// Download file function - using fetch API
async function downloadFile(filename, downloadName) {
  try {
    // Show download prompt
    const downloadBtn = document.getElementById('download-btn');
    const originalText = downloadBtn.textContent;
    downloadBtn.textContent = 'DOWNLOADING...';
    downloadBtn.disabled = true;

    // Use fetch to get file
    const response = await fetch(filename);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get file content
    const blob = await response.blob();

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = downloadName;
    link.style.display = 'none';

    // Add to page and trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);

    // Restore button state
    downloadBtn.textContent = originalText;
    downloadBtn.disabled = false;

  } catch (error) {
    alert(`Download failed: ${error.message}`);

    // Restore button state
    const downloadBtn = document.getElementById('download-btn');
    downloadBtn.textContent = 'DOWNLOAD';
    downloadBtn.disabled = false;
  }
}

// Apply sorting
function applySorting() {
  if (currentSortCategory === 'time') {
    if (currentSortDirection === 'high') {
      // Sort by number descending (newest first)
      allRobotImages = [...originalRobotImages];
    } else {
      // Sort by number ascending (oldest first)
      allRobotImages = [...originalRobotImages].reverse();
    }
  } else if (currentSortCategory === 'filter') {
    if (currentSortDirection === 'high') {
      // Show only ABOT 2.0 new additions (300+)
      allRobotImages = originalRobotImages.filter(robot => robot.isAbotNew);
    } else {
      // Show only original ones (1-299)
      allRobotImages = originalRobotImages.filter(robot => !robot.isAbotNew).reverse();
    }
  } else {
    // Sort by score (perception, behavior, total)
    allRobotImages = [...originalRobotImages].sort((a, b) => {
      const scoreA = getRobotScore(a.name, currentSortCategory);
      const scoreB = getRobotScore(b.name, currentSortCategory);

      if (currentSortDirection === 'high') {
        return scoreB - scoreA; // High to low
      } else {
        return scoreA - scoreB; // Low to high
      }
    });
  }

  // Recalculate total pages
  totalPages = Math.ceil(allRobotImages.length / imagesPerPage);
  currentPage = 1;
}

// Update page info
function updatePageInfo() {
  const currentPageSpan = document.getElementById('current-page');
  const totalPagesSpan = document.getElementById('total-pages');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');

  currentPageSpan.textContent = currentPage;
  totalPagesSpan.textContent = totalPages;

  // Update button state
  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= totalPages;
}

// Set up navigation events
function setupNavigationEvents() {
  const navItems = document.querySelectorAll('.nav-item');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const section = item.getAttribute('data-section');
      switchToSection(section);

      // Update navigation state
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
    });
  });
}

// Switch interface
function switchToSection(section) {
  const homeContent = document.getElementById('home-content');
  const aboutContent = document.getElementById('about-content');
  const imageContent = document.getElementById('image-content');
  const canvas = document.getElementById('abot-canvas');

  // Check if currently in image interface
  const isCurrentlyInImageSection = imageContent.classList.contains('active');

  if (isCurrentlyInImageSection && section !== 'image') {
    // Switch from image interface to other interfaces: smooth fade out

    // First disable all child elements' CSS transition to prevent conflicts
    const glassBackground = imageContent.querySelector('.glass-background');
    const textContent = imageContent.querySelector('.image-text-content');
    const imageContentImages = imageContent.querySelectorAll('img');

    // Save original transition values
    const originalTransitions = {
      imageContent: imageContent.style.transition,
      glassBackground: glassBackground ? glassBackground.style.transition : '',
      textContent: textContent ? textContent.style.transition : ''
    };

    // Disable all transitions
    imageContent.style.transition = 'none';
    if (glassBackground) glassBackground.style.transition = 'none';
    if (textContent) textContent.style.transition = 'none';
    imageContentImages.forEach(img => img.style.transition = 'none');

    // Create custom fade out animation
    let opacity = 1;
    const fadeStep = 0.05;
    const fadeInterval = 15;

    const fadeOut = setInterval(() => {
      opacity -= fadeStep;
      const currentOpacity = Math.max(0, opacity);

      // Set opacity for both container and child elements
      imageContent.style.opacity = currentOpacity;
      if (glassBackground) glassBackground.style.opacity = currentOpacity;
      if (textContent) textContent.style.opacity = currentOpacity;

      if (opacity <= 0) {
        clearInterval(fadeOut);

        // Immediately remove active class, don't give CSS any chance to redisplay
        imageContent.classList.remove('active');

        // Immediately execute interface switch
        performSectionSwitch(section, homeContent, aboutContent, imageContent, canvas);

        // Reset all styles
        setTimeout(() => {
          imageContent.style.transition = originalTransitions.imageContent;
          imageContent.style.opacity = '';
          if (glassBackground) {
            glassBackground.style.transition = originalTransitions.glassBackground;
            glassBackground.style.opacity = '';
          }
          if (textContent) {
            textContent.style.transition = originalTransitions.textContent;
            textContent.style.opacity = '';
          }
          imageContentImages.forEach(img => img.style.transition = '');
        }, 50);
      }
    }, fadeInterval);

  } else {
    // Other cases: direct switch
    performSectionSwitch(section, homeContent, aboutContent, imageContent, canvas);
  }
}

// Execute actual interface switch
function performSectionSwitch(section, homeContent, aboutContent, imageContent, canvas) {
  // Hide other interfaces (but don't repeat operations on image interface)
  homeContent.classList.add('hidden');
  aboutContent.classList.remove('active');
  canvas.style.opacity = '0';
  canvas.style.pointerEvents = 'none';

  // Only remove image's active class when not switching from image interface
  if (section !== 'image' && !imageContent.style.opacity) {
    imageContent.classList.remove('active');
  }

  if (section === 'home') {
    // Show HOME interface
    homeContent.classList.remove('hidden');
    canvas.style.opacity = '1';
    canvas.style.pointerEvents = 'auto';
  } else if (section === 'about') {
    // Show ABOUT interface
    aboutContent.classList.add('active');
  } else if (section === 'image') {
    // Show IMAGE interface
    // Ensure all inline styles are cleared
    imageContent.style.transition = '';
    imageContent.style.opacity = '';

    const glassBackground = imageContent.querySelector('.glass-background');
    const textContent = imageContent.querySelector('.image-text-content');
    if (glassBackground) {
      glassBackground.style.transition = '';
      glassBackground.style.opacity = '';
    }
    if (textContent) {
      textContent.style.transition = '';
      textContent.style.opacity = '';
    }

    imageContent.classList.add('active');
    initImageGallery();
  }
}



// Show robot details popup - updated version 2024-07-13
function showRobotDetails(robotName) {
  const data = findMatchingRobotData(robotName);
  if (!data) {
    return;
  }

  // Check if ranking data exists, if not recalculate
  if (!data.rankings) {
    calculateRankingsAndPercentiles();
  }

  // Get corresponding image filename based on robot name
  const getImageFileName = (name) => {
    // First search for matching image in originalRobotImages
    if (originalRobotImages && originalRobotImages.length > 0) {
      const matchingImage = originalRobotImages.find(img => img.name === name);
      if (matchingImage) {
        return matchingImage.src;
      }
    }

    // If not found, try searching in IMAGE_LIST
    const cleanName = name.toLowerCase().replace(/\s+/g, '_').replace(/[^\w-]/g, '');
    for (const imagePath of IMAGE_LIST) {
      const fileName = imagePath.split('/').pop().toLowerCase();
      const fileNameWithoutExt = fileName.replace('.jpg', '').replace(/^\d+_/, '');
      if (fileNameWithoutExt === cleanName || fileName.includes(cleanName)) {
        return imagePath;
      }
    }

    // Finally try constructing filename
    const possibleNames = [
      `robot_picture/${cleanName}.jpg`,
      `robot_picture/${name.toLowerCase().replace(/\s+/g, '-')}.jpg`,
      `robot_picture/${name.toLowerCase().replace(/\s+/g, '_')}.jpg`
    ];

    return possibleNames[0];
  };

  const imageFileName = getImageFileName(robotName);

  // Extract robot number from image filename
  const extractRobotNumber = (fileName) => {
    const match = fileName.match(/(\d+)_/);
    return match ? parseInt(match[1]) : 0;
  };

  const robotNumber = extractRobotNumber(imageFileName);

  // Create popup HTML
  const modalHTML = `
    <div class="robot-modal-overlay" id="robotModal">
      <div class="robot-modal">
        <div class="robot-modal-header">
          <h2>${robotName}</h2>
          <button class="robot-modal-close" onclick="closeRobotDetails()">&times;</button>
        </div>
        <div class="robot-modal-content">
          <div class="robot-modal-left">
            <img src="${imageFileName}" alt="${robotName}" class="robot-detail-image"
                 onerror="this.src='robot_picture/1_jia_jia_robot.jpg'; this.onerror=null;">
          </div>
          <div class="robot-modal-right">
            <div class="robot-info">
              <h3>ROBOT INFORMATION</h3>

              <!-- Robot basic information -->
              <div class="robot-basic-info">
                <div class="info-item">
                  <span class="info-label">Name:</span>
                  <span class="info-value">${data.originalName || robotName}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Developer:</span>
                  <span class="info-value">${data.developer || 'Unknown'}</span>
                </div>
                ${data.website ? `
                <div class="info-item">
                  <span class="info-label">Website:</span>
                  <a href="${data.website.trim()}" target="_blank" rel="noopener noreferrer" class="info-link">${data.website.trim()}</a>
                </div>
                ` : ''}
                <div class="info-item">
                  <span class="info-label">Source:</span>
                  <span class="info-value">${robotNumber >= 300 ? 'ABOT 2.0' : 'Original ABOT'}</span>
                </div>
              </div>

              <!-- Performance data -->
              <div class="robot-stats">
                <div class="stat-item">
                  <div>
                    <span class="stat-label">Perceptual Potential:</span>
                    <span class="stat-value">${data.perception.toFixed(3)}</span>
                  </div>
                  ${data.rankings ? `
                  <div class="stat-ranking">
                    <span class="rank-info">Rank: #${data.rankings.perception.rank}</span>
                    <div class="percentile-bar">
                      <div class="percentile-fill" style="width: ${data.rankings.perception.percentile}%"></div>
                      <span class="percentile-text">${data.rankings.perception.percentile}th Percentile</span>
                    </div>
                  </div>
                  ` : ''}
                </div>
                <div class="stat-item">
                  <div>
                    <span class="stat-label">Behavioral Potential:</span>
                    <span class="stat-value">${data.behavior.toFixed(3)}</span>
                  </div>
                  ${data.rankings ? `
                  <div class="stat-ranking">
                    <span class="rank-info">Rank: #${data.rankings.behavior.rank}</span>
                    <div class="percentile-bar">
                      <div class="percentile-fill" style="width: ${data.rankings.behavior.percentile}%"></div>
                      <span class="percentile-text">${data.rankings.behavior.percentile}th Percentile</span>
                    </div>
                  </div>
                  ` : ''}
                </div>
                <div class="stat-item total-score">
                  <div>
                    <span class="stat-label">Total Score:</span>
                    <span class="stat-value">${data.total.toFixed(3)}</span>
                  </div>
                  ${data.rankings ? `
                  <div class="stat-ranking">
                    <span class="rank-info">Rank: #${data.rankings.total.rank}</span>
                    <div class="percentile-bar">
                      <div class="percentile-fill" style="width: ${data.rankings.total.percentile}%"></div>
                      <span class="percentile-text">${data.rankings.total.percentile}th Percentile</span>
                    </div>
                  </div>
                  ` : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add to page
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Add click outside to close functionality
  const modalOverlay = document.getElementById('robotModal');
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeRobotDetails();
    }
  });

  // Add show animation
  setTimeout(() => {
    const modal = document.getElementById('robotModal');
    if (modal) {
      modal.classList.add('show');
    }
  }, 10);
}

// Close robot details popup
function closeRobotDetails() {
  const modal = document.getElementById('robotModal');
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

// Clock functionality
function updateClock() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const clockElement = document.getElementById('clock');
  if (clockElement) {
    clockElement.textContent = timeString;
  }
}

// Initialize after page load
document.addEventListener('DOMContentLoaded', function() {
  // Setup navigation events
  setupNavigationEvents();

  // Start clock (but don't show UI elements, wait for animation completion)
  updateClock();
  setInterval(updateClock, 1000);
});


