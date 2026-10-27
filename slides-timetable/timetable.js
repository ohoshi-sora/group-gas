/**
 * 全体設定
 */
const CONFIG = {
  // 書き込む表の場所。どちらも 0 から数える（SLIDE_INDEX: 1 は2枚目のスライド、TABLE_INDEX: 0 はその中の1つ目の表）
  SLIDE_INDEX: 1,
  TABLE_INDEX: 0,

  // 全体説明の開始時刻（"H:mm"）
  START_TIME: "9:00",
  // 全体説明の時間（分）の初期値。メニュー「全体説明時間を更新」で入力した値があれば、そちらを使う
  DEFAULT_OVERVIEW_MIN: 40,
  // 各クールの時間（分）の初期値。メニュー「各クール時間を更新」で入力した値があれば、そちらを使う
  SESSION_MIN: 30,
  // クールとクールの間の休憩（分）。全体説明と第1クールの間には入れない
  BREAK_MIN: 5,

  // クール数。表は1行目が全体説明、2行目から COOL_COUNT 行がクール。group-assign の TOTAL_COOLS と合わせる
  COOL_COUNT: 3,
  // 1クールのグループ数。グループ番号は第1クールが 1〜この数、第2クールがその続きになる（7 なら 1~7、8~14…）
  // group-assign の TEAMS_PER_COHORT と合わせる
  TEAMS_PER_COHORT: 7
};

// メニューで入力した時間の保存先（スライドファイルごとに保存される）
const PROP_KEYS = {
  OVERVIEW_MIN: "overview_min",
  SESSION_MIN: "session_min"
};

function onOpen() {
  SlidesApp.getUi()
    .createMenu('スライド操作')
    .addItem('全体説明時間を更新', 'promptUpdateOverviewDuration')
    .addItem('各クール時間を更新', 'promptUpdateSessionDuration')
    .addItem('初期値に戻す', 'resetDurations')
    .addItem('表を書き直す（CONFIG の変更を反映）', 'updateTableContent')
    .addToUi();
}

/**
 * 保存済み設定を取得
 */
function getSavedDurations() {
  const props = PropertiesService.getDocumentProperties();

  return {
    overviewMin: Number(props.getProperty(PROP_KEYS.OVERVIEW_MIN)) || CONFIG.DEFAULT_OVERVIEW_MIN,
    sessionMin: Number(props.getProperty(PROP_KEYS.SESSION_MIN)) || CONFIG.SESSION_MIN
  };
}

/**
 * 全体説明時間を更新
 */
function promptUpdateOverviewDuration() {
  const ui = SlidesApp.getUi();
  const res = ui.prompt(
    '全体説明時間の更新',
    '全体説明の時間（分）を入力してください:',
    ui.ButtonSet.OK_CANCEL
  );

  if (res.getSelectedButton() !== ui.Button.OK) return;

  const duration = Number(res.getResponseText().trim());

  if (!Number.isInteger(duration) || duration <= 0) {
    ui.alert('正の整数を入力してください。');
    return;
  }

  const props = PropertiesService.getDocumentProperties();
  props.setProperty(PROP_KEYS.OVERVIEW_MIN, String(duration));

  updateTableContent();
}

/**
 * 各クール時間を更新
 */
function promptUpdateSessionDuration() {
  const ui = SlidesApp.getUi();
  const res = ui.prompt(
    '各クール時間の更新',
    '各クールの時間（分）を入力してください:',
    ui.ButtonSet.OK_CANCEL
  );

  if (res.getSelectedButton() !== ui.Button.OK) return;

  const duration = Number(res.getResponseText().trim());

  if (!Number.isInteger(duration) || duration <= 0) {
    ui.alert('正の整数を入力してください。');
    return;
  }

  const props = PropertiesService.getDocumentProperties();
  props.setProperty(PROP_KEYS.SESSION_MIN, String(duration));

  updateTableContent();
}

/**
 * 初期値に戻す
 */
function resetDurations() {
  const props = PropertiesService.getDocumentProperties();
  props.deleteProperty(PROP_KEYS.OVERVIEW_MIN);
  props.deleteProperty(PROP_KEYS.SESSION_MIN);

  updateTableContent();
}

/**
 * テーブル内容を更新
 */
function updateTableContent() {
  const presentation = SlidesApp.getActivePresentation();
  const slides = presentation.getSlides();

  if (slides.length <= CONFIG.SLIDE_INDEX) {
    SlidesApp.getUi().alert("指定されたスライドが存在しません。");
    return;
  }

  const slide = slides[CONFIG.SLIDE_INDEX];
  const tables = slide.getTables();

  if (tables.length <= CONFIG.TABLE_INDEX) {
    SlidesApp.getUi().alert("指定されたテーブルが見つかりません。");
    return;
  }

  const table = tables[CONFIG.TABLE_INDEX];

  const durations = getSavedDurations();
  const ovDur = durations.overviewMin;
  const ssDur = durations.sessionMin;

  let currentTime = parseTime(CONFIG.START_TIME);

  // 全体説明
  let endTime = addMinutes(currentTime, ovDur);
  updateTableCell(table, 0, 1, formatTime(currentTime));
  updateTableCell(table, 0, 3, formatTime(endTime));
  currentTime = endTime;

  // 各クール
  for (let i = 0; i < CONFIG.COOL_COUNT; i++) {
    endTime = addMinutes(currentTime, ssDur);

    updateTableCell(table, i + 1, 0, buildCoolLabel(i + 1));
    updateTableCell(table, i + 1, 1, formatTime(currentTime));
    updateTableCell(table, i + 1, 3, formatTime(endTime));

    currentTime = addMinutes(endTime, CONFIG.BREAK_MIN);
  }
}

/**
 * クール行の1列目の文言（例: "第2クール\nグループ番号：8~14"）
 * グループ番号は group-assign と同じく、クールごとに TEAMS_PER_COHORT 個ずつの通し番号
 */
function buildCoolLabel(coolNo) {
  const first = (coolNo - 1) * CONFIG.TEAMS_PER_COHORT + 1;
  const last = coolNo * CONFIG.TEAMS_PER_COHORT;
  return `第${coolNo}クール\nグループ番号：${first}~${last}`;
}

/**
 * セル更新
 */
function updateTableCell(table, row, col, text) {
  table.getCell(row, col).getText().setText(text);
}

/**
 * "9:00" のような文字列をDateに変換
 */
function parseTime(timeText) {
  const [hour, minute] = timeText.split(":").map(Number);
  return new Date(2000, 0, 1, hour, minute, 0);
}

/**
 * 分を加算
 */
function addMinutes(time, minsToAdd) {
  return new Date(time.getTime() + minsToAdd * 60000);
}

/**
 * 時刻表示
 */
function formatTime(time) {
  return Utilities.formatDate(time, Session.getScriptTimeZone(), "HH:mm");
}
