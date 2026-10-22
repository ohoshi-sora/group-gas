/*************************************************
 *  科目セットアップ
 *
 *  setupCourse() を1回実行すると、新しい科目に必要な次の一式を作る。
 *   - クール申請フォーム / パスワード再発行フォーム
 *   - 管理用スプレッドシート（2フォームの回答先。「設定」シート付き）
 *   - 学生共有用スプレッドシート
 *
 *  本体コード（main.js）は、できた管理用スプレッドシートの Apps Script に手動で貼り付ける。
 *  科目ごとの値と各 ID は、「設定」シートに、本体の「const CONFIG = {...};」のコードとして
 *  出力される。それをコピーして、本体の冒頭の CONFIG と置き換える。
 *************************************************/
const SETUP = {
  // ===== この科目の設定（ここだけ書き換えて実行する）=====
  COURSE_NAME: 'ここに科目名',

  // ===== オーバーライド（本体の既定値を、この科目用に上書きする）=====
  // 本体コードの CONFIG と同じ名前で書く。書かなかった項目は本体の既定値のまま。
  // 結果は、管理用スプレッドシートの「設定」シートに、本体の CONFIG 全体のコードとして出力される。
  // （各 ID は自動で書かれるので、ここには書かない）
  OVERRIDES: {
    TOTAL_COOLS: 3,        // クール数（3 または 4）
    TEAMS_PER_COHORT: 20,   // 1クールのチーム数
    MEMBERS_PER_TEAM: 4,   // 1チームの人数（最大）。1クールの定員 = チーム数 × 人数
    MAIL_DOMAIN: '@example.ac.jp', // パスワードの送信先は「学籍番号 + この値」。必ず変更する

    // 当日申請者の配置先クール。左から優先して空き枠へ入れる（クール数を超える番号は無視される）
    SAME_DAY_SETTINGS: { GENERIC_COOL_PRIORITY: [2, 3, 4] }

    // 例）初回パスワードの送信日程（日本時間。先頭から順に使う）
    // INITIAL_PASSWORD_SETTINGS: { SEND_SCHEDULE: [{ at: '2026/09/29 12:00' }] },
  },

  // ===== 受付スケジュール（毎週）。day: 0=日 1=月 2=火 3=水 4=木 5=金 6=土 =====
  // ここを書き換えると、次の3つが自動で揃う（文言とスケジュールの食い違いを防ぐ）。
  //   1. フォームの説明文・回答停止中メッセージの「いつからいつまで」
  //   2. 本体の週次スケジュール（出力する CONFIG の WEEKLY_SCHEDULE）
  //   3. グループ分けの実行時刻 = 締切の MAKE_GROUPS_AFTER_CLOSE_MIN 分後
  //      データ初期化の時刻     = 開始の RESET_BEFORE_OPEN_MIN 分前
  SCHEDULE: {
    OPEN: { day: 5, hour: 12, minute: 15 },    // 回答開始: 金 12:15
    CLOSE: { day: 4, hour: 21, minute: 0 },    // 回答締切: 木 21:00
    PUBLISH: { day: 4, hour: 22, minute: 0 },  // グループ公開: 木 22:00
    MAKE_GROUPS_AFTER_CLOSE_MIN: 1,
    RESET_BEFORE_OPEN_MIN: 25
  },

  // ===== 保存先・共有（あまり変更しない）=====
  // 作成したファイルの置き場所。上から順に、最初に当てはまるものを使う。
  //   FOLDER_ID               … 既存フォルダのID（フォルダURLの /folders/xxxxx の xxxxx）
  //   SAME_FOLDER_AS_SCRIPT   … true なら、このセットアップ用 GAS と同じフォルダに作る
  //   FOLDER_NAME             … マイドライブ直下に、この名前で新しいフォルダを作る
  //   （すべて空・falseなら、マイドライブ直下のまま）
  FOLDER_ID: '',
  SAME_FOLDER_AS_SCRIPT: true,
  FOLDER_NAME: '',

  // 学生共有用スプレッドシートの共有範囲
  //   'NONE'              … 共有しない（作成者のみ）
  //   'DOMAIN_WITH_LINK'  … 組織内でリンクを知っている人が閲覧
  //   'ANYONE_WITH_LINK'  … リンクを知っている全員が閲覧
  STUDENT_SHARING: 'ANYONE_WITH_LINK',

  // ===== フォームの質問見出し・選択肢・シート名 =====
  // 下の値は、出力する CONFIG にも書き込まれるので、フォームと本体は必ず一致する。
  HEADERS: {
    TS: 'タイムスタンプ',
    ID: '学籍番号',
    PASSWORD: 'パスワード',
    PREF: '希望内容',
    NAME: '氏名',
    REASON: 'ベーシッククラスに参加しようと思った理由を記述してください。',
    FREE: 'わからなかったところ' // 本体 CONFIG.HEADERS.FREE の既定値と同じ。フォームの質問文と完全一致が必要
  },
  BC_PREF_VALUE: 'BC（ベーシック）希望', // 第Nクール希望 は TOTAL_COOLS から自動生成
  // シート名。本体の CONFIG.SHEETS / STUDENT_SHEETS / INITIAL_PASSWORD_SETTINGS.SHEET_NAME と同じ値。
  SHEET_NAMES: {
    COOL_RESPONSES: 'クール申請フォーム',
    PASSWORD_RESPONSES: 'パスワードフォーム',
    VALID: '有効申請',
    INVALID: '無効申請',
    SAME_DAY: '当日申請',
    BC: 'BC参加者',
    MASTER: '学籍・パスワード一覧',
    PASSWORD_LOG: 'パスワードログ',
    GROUP_CHECK: 'グループ分け確認修正用',
    INITIAL_PASSWORD: '初回パスワード送信',
    STUDENT_ROSTER: 'クール分け',
    STUDENT_GROUPS: 'グループ分け'
  },
  // 管理用スプレッドシートのタブの並び順（左から）。SHEET_NAMES のキーで書く。
  // 'SETTINGS' は「設定」シート。ここに書かなかったシートは、一番右に残る。
  // 初期値は既存の管理用スプレッドシートのタブ順（screenshot/ のスクリーンショット）。「設定」は最後。
  SHEET_ORDER: [
    'COOL_RESPONSES', 'BC', 'VALID', 'INVALID', 'GROUP_CHECK', 'SAME_DAY',
    'PASSWORD_RESPONSES', 'MASTER', 'PASSWORD_LOG', 'INITIAL_PASSWORD',
    'SETTINGS'
  ],
  // 学生共有用シートの見出しに使う表示ラベル（本体の CONFIG.LABELS と同じ値）
  LABELS: { BC: 'BC', REAPPLY: '再度申請', MANUAL: '手動割り当て' },

  // ===== フォームの仕様 =====
  // 学籍番号の入力規則（正規表現）。b/m + 数字7桁
  ID_PATTERN: '^[bm]\\d{7}$',
  ID_PATTERN_HELP: '半角英字 b・数字7桁で入力してください。',

  // true : 「BC希望」を選んだ人だけ「BCクラス申し込み」セクションへ進み、
  //        それ以外の希望は選択後に送信される（氏名・理由はBC希望者のみ入力）
  // false: 全員が「BCクラス申し込み」セクションへ進む
  BC_ROUTING: true,

  // ===== フォームの文言 =====
  // {COURSE} 科目名 / {STUDENT_URL} 学生共有用シートのURL /
  // {PASSWORD_FORM_URL} パスワードフォームのURL / {COOL_FORM_URL} クール申請フォームのURL
  // {OPEN_AT} 回答開始（例: 金曜日 12:15）/ {CLOSE_AT} 回答締切（例: 翌週 木曜日 21:00）/
  // {PUBLISH_AT} グループ公開（例: 木曜日 22:00）… いずれも SCHEDULE から自動で作られる
  // ※フォームの説明文は Apps Script では太字にできないため、プレーンテキストになる。
  FORM_TEXT: {
    COOL_FILE_NAME: 'グループワーク・BC申請Form',
    COOL_TITLE: '{COURSE} グループワーク・BC申請Form',
    // 回答を受け付けていないときに回答者へ表示するメッセージ
    COOL_CLOSED_MESSAGE: '回答期間は{OPEN_AT} 〜 {CLOSE_AT}です。',
    COOL_DESCRIPTION:
      '回答期間：{OPEN_AT} 〜 {CLOSE_AT} まで\n\n' +
      '決定方法：希望クールの決定は 先着順 です。\n\n' +
      '注意事項：\n' +
      '・毎週必ず申請してください。申請したら学生共有スプレッドシートで必ず申請状況を確認してください。\n' +
      '・申請は一度しかすることができません。ただし以下の場合は再度申請をすることができます。\n' +
      '　・ベーシックに移動したい人\n' +
      '　・「再度申請」欄に自分の学籍がある人\n' +
      '・申請状況によっては希望するクールに入れない可能性もあります。\n' +
      '・申請時にメールアドレスを収集します。収集したメールアドレスは、申請後の確認メールを送信するためにのみ使用し、その他の目的には使用しません。\n\n' +
      '公開スケジュール：\n' +
      '・クール分け：Googleフォームで回答すると、即時にスプレッドシートへ反映されます。\n' +
      '・グループ分け：毎週{PUBLISH_AT} 以降にスプレッドシート上で公開されます。\n\n' +
      '学生共有スプレッドシート（クール分け・グループ分け表示用）\n{STUDENT_URL}\n\n' +
      'パスワード忘れForm\n{PASSWORD_FORM_URL}',
    COOL_CONFIRMATION: '回答を記録しました。学生共有用スプレッドシートに名前が反映されているか確認してください。',

    PASSWORD_FILE_NAME: 'パスワード再発行Form',
    PASSWORD_TITLE: '{COURSE} パスワード再発行Form',
    PASSWORD_DESCRIPTION:
      'このフォームは、グループワーク・BC申請Formで使用するパスワードを\n' +
      '忘れてしまった人のためのフォームです。\n\n' +
      '注意事項：\n\n' +
      '・このフォームで申請された内容をもとに、パスワードを発行し、学校のメールアドレス宛に送信します。\n' +
      '・メールは迷惑メールに届く可能性が高いので、迷惑メールも確認してください。\n' +
      '・グループワーク・BC申請Formに回答する際は、メールで届いた4桁のパスワードを入力してください。\n' +
      '・パスワードを再発行した場合、以前のパスワードは使用できなくなります。\n' +
      '・申請内容を確認後、メール送信までに時間がかかる場合があります。\n' +
      '・メールが届いたら、パスワードを忘れないよう各自で控えておいてください。\n\n' +
      'パスワードを受け取った後に、\n' +
      'グループワーク・BC申請Formから希望クールの申請を行ってください。\n{COOL_FORM_URL}',
    PASSWORD_CONFIRMATION:
      '学校のメールアドレス宛にメールを送信しました。\n' +
      'メールが届いていない場合は、迷惑メールフォルダも確認してください。',

    ID_HELP: '半角英数字で入力してください。例：b2230000',
    PASSWORD_HELP:
      '4桁の数字を入力してください。\n\n' +
      'パスワードを設定していない・忘れた方は以下のFormから申請してください。\n{PASSWORD_FORM_URL}',
    BC_SECTION_TITLE: 'BCクラス申し込み'
  },

  TIME_ZONE: 'Asia/Tokyo'
};


/*************************************************
 *  メイン
 *************************************************/
function setupCourse() {
  validateSetup_();

  // フォルダは先に解決する（IDが誤っていれば、ファイルを作る前に失敗させる）
  const folder = resolveFolder_();
  const totalCools = Number(SETUP.OVERRIDES.TOTAL_COOLS);
  const prefChoices = buildPrefChoices_(totalCools);

  // 1) スプレッドシート
  const adminSS = SpreadsheetApp.create(`${SETUP.COURSE_NAME}_管理用(Form_GAS)`);
  adminSS.setSpreadsheetTimeZone(SETUP.TIME_ZONE);

  const studentSS = SpreadsheetApp.create(`${SETUP.COURSE_NAME}_学生共有用`);
  studentSS.setSpreadsheetTimeZone(SETUP.TIME_ZONE);
  const rosterSheet = studentSS.getSheets()[0];
  rosterSheet.setName(SETUP.SHEET_NAMES.STUDENT_ROSTER);
  const adminDefaultSheetId = adminSS.getSheets()[0].getSheetId(); // 後で削除する初期シート

  // 2) フォーム
  //    説明文が互いの URL を含むため、パスワードフォーム → クール申請フォームの順に作り、
  //    最後にパスワードフォームの説明へクール申請フォームの URL を入れる。
  const passwordForm = createPasswordForm_();
  const coolForm = createCoolForm_(prefChoices, Object.assign({
    STUDENT_URL: studentSS.getUrl(),
    PASSWORD_FORM_URL: shortFormUrl_(passwordForm)
  }, buildScheduleVars_()));
  passwordForm.setDescription(fillPlaceholders_(SETUP.FORM_TEXT.PASSWORD_DESCRIPTION, {
    COOL_FORM_URL: shortFormUrl_(coolForm)
  }));

  // 3) フォームを管理用スプレッドシートへ紐づけ、回答シート名を本体の期待値に揃える
  linkFormToSpreadsheet_(coolForm, adminSS.getId(), SETUP.SHEET_NAMES.COOL_RESPONSES);
  linkFormToSpreadsheet_(passwordForm, adminSS.getId(), SETUP.SHEET_NAMES.PASSWORD_RESPONSES);

  // 4) 本体の「初期設定」が作るシートを先に作る（見出し・レイアウトまで）
  createAdminManagedSheets_(SpreadsheetApp.openById(adminSS.getId()));
  createStudentSheets_(SpreadsheetApp.openById(studentSS.getId()), rosterSheet.getSheetId(), totalCools);

  // 5) 「設定」シート（本体の CONFIG をコードとして出力する）
  const config = buildFinalConfig_({
    studentSpreadsheetId: studentSS.getId(),
    rosterGid: rosterSheet.getSheetId(),
    coolFormId: coolForm.getId(),
    passwordFormId: passwordForm.getId(),
    prefChoices
  });
  writeConfigCodeSheet_(SpreadsheetApp.openById(adminSS.getId()), renderConfigSource_(config));

  // 6) 後始末（空の初期シート削除・フォルダ移動・共有）
  removeSheetById_(SpreadsheetApp.openById(adminSS.getId()), adminDefaultSheetId);
  reorderSheets_(SpreadsheetApp.openById(adminSS.getId()), SETUP.SHEET_ORDER);
  if (folder) {
    for (const id of [adminSS.getId(), studentSS.getId(), coolForm.getId(), passwordForm.getId()]) {
      DriveApp.getFileById(id).moveTo(folder);
    }
  }
  applyStudentSharing_(studentSS.getId());

  // 7) 結果
  const result = {
    admin: adminSS.getUrl(),
    student: studentSS.getUrl(),
    coolFormEdit: coolForm.getEditUrl(),
    coolFormPublished: shortFormUrl_(coolForm),
    passwordFormEdit: passwordForm.getEditUrl(),
    passwordFormPublished: shortFormUrl_(passwordForm)
  };
  Logger.log(buildSetupReport_(result));
  return result;
}


/*************************************************
 *  フォーム作成
 *  質問の見出しは本体の CONFIG.HEADERS と完全一致させる。
 *************************************************/
function createCoolForm_(prefChoices, urls) {
  const H = SETUP.HEADERS;
  const T = SETUP.FORM_TEXT;

  const form = FormApp.create(T.COOL_FILE_NAME);
  form.setTitle(applyCourseName_(T.COOL_TITLE));
  form.setDescription(fillPlaceholders_(T.COOL_DESCRIPTION, urls));

  // セクション1
  addStudentIdItem_(form);
  form.addTextItem()
    .setTitle(H.PASSWORD)
    .setHelpText(fillPlaceholders_(T.PASSWORD_HELP, urls))
    .setRequired(true);
  const prefItem = form.addMultipleChoiceItem().setTitle(H.PREF).setRequired(true);

  // セクション2（BC申込）
  const bcPage = form.addPageBreakItem().setTitle(T.BC_SECTION_TITLE);
  form.addTextItem().setTitle(H.NAME).setRequired(true);
  form.addParagraphTextItem().setTitle(H.REASON).setRequired(true);
  form.addParagraphTextItem().setTitle(H.FREE);

  // 希望内容の選択肢。遷移付きの選択肢と遷移なしの選択肢は同じ質問に混在できない。
  prefItem.setChoices(prefChoices.map(value => {
    if (!SETUP.BC_ROUTING) return prefItem.createChoice(value);
    return value === SETUP.BC_PREF_VALUE
      ? prefItem.createChoice(value, bcPage)
      : prefItem.createChoice(value, FormApp.PageNavigationType.SUBMIT);
  }));

  applyCommonFormSettings_(form, T.COOL_CONFIRMATION);
  // Apps Script ではオン・オフしか選べず、「確認済み」にはならない（作成後に手動で変更する）。
  form.setCollectEmail(true);
  // 受付の開閉は本体の週次スケジュールが行う。作成直後は閉じておく。
  form.setCustomClosedFormMessage(fillPlaceholders_(T.COOL_CLOSED_MESSAGE, urls));
  form.setAcceptingResponses(false);
  return form;
}

function createPasswordForm_() {
  const H = SETUP.HEADERS;
  const T = SETUP.FORM_TEXT;

  const form = FormApp.create(T.PASSWORD_FILE_NAME);
  form.setTitle(applyCourseName_(T.PASSWORD_TITLE));
  // 説明文はクール申請フォームの URL が決まってから setupCourse で設定する。

  form.addTextItem().setTitle(H.NAME).setRequired(true);
  addStudentIdItem_(form);

  applyCommonFormSettings_(form, T.PASSWORD_CONFIRMATION);
  form.setCollectEmail(false);
  // パスワードの再発行は常時受け付ける。本体の週次スケジュールでも、既定では開閉しない。
  form.setAcceptingResponses(true);
  return form;
}

function addStudentIdItem_(form) {
  const validation = FormApp.createTextValidation()
    .setHelpText(SETUP.ID_PATTERN_HELP)
    .requireTextMatchesPattern(SETUP.ID_PATTERN)
    .build();
  return form.addTextItem()
    .setTitle(SETUP.HEADERS.ID)
    .setHelpText(SETUP.FORM_TEXT.ID_HELP)
    .setValidation(validation)
    .setRequired(true);
}

// 2つのフォームで共通の設定（既存フォームの「設定」タブに合わせる）
function applyCommonFormSettings_(form, confirmationMessage) {
  form.setConfirmationMessage(confirmationMessage);
  form.setShowLinkToRespondAgain(true);
  form.setAllowResponseEdits(false);
  form.setLimitOneResponsePerUser(false);
  form.setProgressBar(false);
  form.setShuffleQuestions(false);
  form.setPublishingSummary(false);
}

/*************************************************
 *  受付スケジュール
 *  SCHEDULE から、フォームの文言と本体の WEEKLY_SCHEDULE を同時に作る。
 *  曜日・時刻は「週の先頭（日曜 0:00）からの分」で計算し、週をまたぐ加減算に対応する。
 *************************************************/
const SETUP_DAY_NAMES = ['日', '月', '火', '水', '木', '金', '土'];
const SETUP_MINUTES_PER_DAY = 24 * 60;
const SETUP_MINUTES_PER_WEEK = 7 * SETUP_MINUTES_PER_DAY;

function toWeekMinutes_(t) {
  return (t.day * 24 + t.hour) * 60 + t.minute;
}

function fromWeekMinutes_(total) {
  const m = ((total % SETUP_MINUTES_PER_WEEK) + SETUP_MINUTES_PER_WEEK) % SETUP_MINUTES_PER_WEEK;
  return {
    day: Math.floor(m / SETUP_MINUTES_PER_DAY),
    hour: Math.floor((m % SETUP_MINUTES_PER_DAY) / 60),
    minute: m % 60
  };
}

function formatWeekTime_(t) {
  const hh = String(t.hour).padStart(2, '0');
  const mm = String(t.minute).padStart(2, '0');
  return `${SETUP_DAY_NAMES[t.day]}曜日 ${hh}:${mm}`;
}

// 文言用の値。締切が開始より週内で後なら同じ週、そうでなければ「翌週」を付ける。
function buildScheduleVars_() {
  const S = SETUP.SCHEDULE;
  const closeNextWeek = toWeekMinutes_(S.CLOSE) <= toWeekMinutes_(S.OPEN);
  return {
    OPEN_AT: formatWeekTime_(S.OPEN),
    CLOSE_AT: (closeNextWeek ? '翌週 ' : '') + formatWeekTime_(S.CLOSE),
    PUBLISH_AT: formatWeekTime_(S.PUBLISH)
  };
}

// 本体 CONFIG.WEEKLY_SCHEDULE のうち、SCHEDULE から決まる5項目
function buildWeeklySchedule_() {
  const S = SETUP.SCHEDULE;
  const entry = (t) => ({ enabled: true, day: t.day, hour: t.hour, minute: t.minute });
  return {
    coolFormOpen: entry(S.OPEN),
    coolFormClose: entry(S.CLOSE),
    makeRandomGroups: entry(fromWeekMinutes_(toWeekMinutes_(S.CLOSE) + S.MAKE_GROUPS_AFTER_CLOSE_MIN)),
    groupPublish: entry(S.PUBLISH),
    reset: entry(fromWeekMinutes_(toWeekMinutes_(S.OPEN) - S.RESET_BEFORE_OPEN_MIN))
  };
}

function buildPrefChoices_(totalCools) {
  const choices = [];
  for (let n = 1; n <= totalCools; n++) choices.push(`第${n}クール希望`);
  choices.push(SETUP.BC_PREF_VALUE);
  return choices;
}

function applyCourseName_(text) {
  return fillPlaceholders_(text, {});
}

function fillPlaceholders_(text, vars) {
  const all = Object.assign({ COURSE: SETUP.COURSE_NAME }, vars);
  return String(text).replace(/\{([A-Z_]+)\}/g, (m, key) => (key in all ? all[key] : m));
}

// 回答用 URL を短縮する。短縮できなければ長い URL のまま使う。
function shortFormUrl_(form) {
  const url = form.getPublishedUrl();
  try {
    return form.shortenFormUrl(url);
  } catch (e) {
    return url;
  }
}


/*************************************************
 *  フォーム → スプレッドシート紐づけ
 *  setDestination で増えた回答シートを、追加前後の差分で特定して改名する。
 *************************************************/
function linkFormToSpreadsheet_(form, spreadsheetId, sheetName) {
  const before = new Set(
    SpreadsheetApp.openById(spreadsheetId).getSheets().map(s => s.getSheetId())
  );

  form.setDestination(FormApp.DestinationType.SPREADSHEET, spreadsheetId);
  SpreadsheetApp.flush();

  // 回答シートの反映が遅れることがあるので数回リトライする
  let created = [];
  for (let i = 0; i < 5; i++) {
    created = SpreadsheetApp.openById(spreadsheetId).getSheets()
      .filter(s => !before.has(s.getSheetId()));
    if (created.length > 0) break;
    Utilities.sleep(1000);
  }
  if (created.length !== 1) {
    throw new Error(`「${sheetName}」: 回答シートを特定できませんでした（新規シート数 ${created.length}）。`);
  }
  created[0].setName(sheetName);
}

// 作成時に最初からあった空シートだけを消す（見出しなしで作った空シートは消さない）
function removeSheetById_(ss, sheetId) {
  if (ss.getSheets().length <= 1) return;
  const sh = ss.getSheets().find(s => s.getSheetId() === sheetId);
  if (sh) ss.deleteSheet(sh);
}


// SHEET_ORDER の順にタブを並べる。書かれていないシートは、その右に元の順で残る。
function reorderSheets_(ss, order) {
  let position = 1;
  for (const key of order) {
    const name = resolveSheetOrderName_(key);
    const sh = ss.getSheetByName(name);
    if (!sh) continue;
    ss.setActiveSheet(sh);
    ss.moveActiveSheet(position++);
  }
  ss.setActiveSheet(ss.getSheets()[0]);
}

function resolveSheetOrderName_(key) {
  return key === 'SETTINGS' ? '設定' : SETUP.SHEET_NAMES[key];
}


/*************************************************
 *  必要シートの作成
 *  本体 initializeManagedSheets / writeRoster_ / resetStudentGroupSheet_ と
 *  同じ見出し・レイアウトを作る。本体の「初期設定」を後で実行しても、
 *  見出しが同じなら何も消えない（食い違えば本体の定義に作り直される）。
 *************************************************/
function createAdminManagedSheets_(ss) {
  const H = SETUP.HEADERS;
  const N = SETUP.SHEET_NAMES;

  const defs = [
    [N.VALID, [H.TS, H.ID, H.PASSWORD, H.PREF, H.NAME, H.REASON, H.FREE, '受付種別', '備考', 'ステータス']],
    [N.INVALID, [H.TS, H.ID, H.PASSWORD, H.PREF, H.NAME, H.REASON, H.FREE, '無効理由', '備考']],
    [N.SAME_DAY, [H.TS, H.ID, H.PREF, 'BCに参加する学生はBCに参加する理由を書いてください', '処理結果', '配置先', '備考', '処理日時']],
    [N.MASTER, [H.ID, H.NAME, 'メールアドレス', 'パスワード', '発行回数', '初回発行日時', '最終発行日時', '有効']],
    [N.PASSWORD_LOG, [H.TS, H.ID, H.NAME, 'メールアドレス', 'パスワード', '種別', '結果', '備考']],
    [N.BC, [H.ID, H.NAME, '参加理由', 'わからなかったところ']],
    [N.GROUP_CHECK, []],
    [N.INITIAL_PASSWORD, [H.ID, H.NAME, 'メールアドレス', 'パスワード', '送信状態', '送信日時', '試行回数', 'エラー内容']]
  ];

  for (const [name, headers] of defs) {
    const sh = ss.getSheetByName(name) || ss.insertSheet(name);
    if (headers.length) {
      sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    }
  }
  ss.getSheetByName(N.INITIAL_PASSWORD).setFrozenRows(1);
}

function createStudentSheets_(ss, rosterSheetId, totalCools) {
  const N = SETUP.SHEET_NAMES;
  const L = SETUP.LABELS;
  const teams = Number(SETUP.OVERRIDES.TEAMS_PER_COHORT) || 7;
  const members = Number(SETUP.OVERRIDES.MEMBERS_PER_TEAM) || 4;
  const capacity = teams * members;

  // 「クール分け」: 見出し行と、各クール列の定員ぶんの背景色
  const roster = ss.getSheets().find(s => s.getSheetId() === rosterSheetId);
  const rosterHeaders = [];
  for (let n = 1; n <= totalCools; n++) rosterHeaders.push(`第${n}クール`);
  rosterHeaders.push(L.BC, L.REAPPLY);
  roster.getRange(1, 1, 1, rosterHeaders.length)
    .setValues([rosterHeaders])
    .setFontWeight('bold')
    .setHorizontalAlignment('center');
  roster.setColumnWidths(1, rosterHeaders.length, 100);
  if (roster.getMaxRows() < 1 + capacity) {
    roster.insertRowsAfter(roster.getMaxRows(), 1 + capacity - roster.getMaxRows());
  }
  for (let c = 1; c <= totalCools; c++) {
    roster.getRange(2, c, capacity, 1).setBackground('#d8e5ff');
  }

  // 「グループ分け」: タイトル行と見出し行
  const groups = ss.getSheetByName(N.STUDENT_GROUPS) || ss.insertSheet(N.STUDENT_GROUPS);
  const titleRow = [];
  const headRow = [];
  const widths = [];
  for (let n = 1; n <= totalCools; n++) {
    titleRow.push(`【第${n}クール】`, '', '');
    headRow.push('グループ番号', '学籍番号', '');
    widths.push(100, 100, 40);
  }
  for (const label of [L.BC, L.REAPPLY, L.MANUAL]) {
    titleRow.push(`【${label}】`, '');
    headRow.push('学籍番号', '');
    widths.push(100, 40);
  }
  groups.getRange(1, 1, 1, titleRow.length).setValues([titleRow]).setFontWeight('bold');
  groups.getRange(2, 1, 1, headRow.length).setValues([headRow]).setFontWeight('bold');
  widths.forEach((w, i) => groups.setColumnWidth(i + 1, w));
}


/*************************************************
 *  設定の組み立て（OVERRIDES + 自動で決まる値）
 *************************************************/
function buildSettings_(ids) {
  // 自動生成する値は OVERRIDES より優先する（ID・選択肢の食い違いを防ぐ）
  const prefValue = {};
  for (let n = 1; n <= Number(SETUP.OVERRIDES.TOTAL_COOLS); n++) prefValue[`COOL${n}`] = ids.prefChoices[n - 1];
  prefValue.BC = SETUP.BC_PREF_VALUE;

  const generated = {
    COURSE_NAME: SETUP.COURSE_NAME,
    STUDENT_SPREADSHEET_ID: ids.studentSpreadsheetId,
    STUDENT_ROSTER_SHEET_GID: ids.rosterGid,
    COOL_FORM_ID: ids.coolFormId,
    PASSWORD_FORM_ID: ids.passwordFormId,
    HEADERS: SETUP.HEADERS,
    PREF_VALUE: prefValue,
    SHEETS: {
      COOL_RESPONSES: SETUP.SHEET_NAMES.COOL_RESPONSES,
      PASSWORD_RESPONSES: SETUP.SHEET_NAMES.PASSWORD_RESPONSES,
      VALID: SETUP.SHEET_NAMES.VALID,
      INVALID: SETUP.SHEET_NAMES.INVALID,
      SAME_DAY: SETUP.SHEET_NAMES.SAME_DAY,
      BC: SETUP.SHEET_NAMES.BC,
      MASTER: SETUP.SHEET_NAMES.MASTER,
      PASSWORD_LOG: SETUP.SHEET_NAMES.PASSWORD_LOG,
      GROUP_CHECK: SETUP.SHEET_NAMES.GROUP_CHECK
    },
    STUDENT_SHEETS: {
      ROSTER: SETUP.SHEET_NAMES.STUDENT_ROSTER,
      GROUPS: SETUP.SHEET_NAMES.STUDENT_GROUPS
    },
    LABELS: SETUP.LABELS,
    INITIAL_PASSWORD_SETTINGS: { SHEET_NAME: SETUP.SHEET_NAMES.INITIAL_PASSWORD },
    WEEKLY_SCHEDULE: buildWeeklySchedule_()
  };

  // OVERRIDES を先に、generated を後に積む（同キーは generated が勝つ）
  const merged = Object.assign({}, SETUP.OVERRIDES);
  for (const key of Object.keys(generated)) {
    const g = generated[key];
    const o = merged[key];
    merged[key] = (isPlainObject_(o) && isPlainObject_(g)) ? Object.assign({}, o, g) : g;
  }
  return merged;
}

// 既定値（CONFIG_DEFAULTS）に、OVERRIDES と自動で決まる値を重ねた、最終的な CONFIG
function buildFinalConfig_(ids) {
  return deepMerge_(CONFIG_DEFAULTS, buildSettings_(ids));
}

function deepMerge_(base, extra) {
  const out = JSON.parse(JSON.stringify(base));
  const apply = (target, src) => {
    for (const key of Object.keys(src)) {
      if (isPlainObject_(src[key]) && isPlainObject_(target[key])) {
        apply(target[key], src[key]);
      } else {
        target[key] = src[key];
      }
    }
  };
  apply(out, extra);
  return out;
}


/*************************************************
 *  「設定」シート：本体の CONFIG をコードとして出力する
 *
 *  本体（main.js）冒頭の「const CONFIG = {...};」と同じ形のコードを、
 *  「設定」シートの A4 セルへ出力する。それをコピーして、本体の冒頭と置き換える。
 *
 *  ⚠️ CONFIG_DEFAULTS と CONFIG_NOTES は、本体の CONFIG の写し（既定値とコメント）。
 *  本体の CONFIG のキー・既定値・コメントを変えたときは、ここも同じに直すこと。
 *  直し忘れると、出力したコードを貼り付けたときに、本体側の変更が失われる。
 *************************************************/
const CONFIG_TEMPLATE_VERSION = 2;

// 出力順もこの順（ADMIN_SPREADSHEET_ID は、式をそのまま出力する）
const CONFIG_DEFAULTS = {
  COURSE_NAME: 'YOUR_COURSE_NAME',
  ADMIN_SPREADSHEET_ID: null,
  STUDENT_SPREADSHEET_ID: 'YOUR_STUDENT_SPREADSHEET_ID',
  STUDENT_ROSTER_SHEET_GID: 0,
  COOL_FORM_ID: 'YOUR_COOL_FORM_ID',
  PASSWORD_FORM_ID: 'YOUR_PASSWORD_FORM_ID',
  TOTAL_COOLS: 4,
  TEAMS_PER_COHORT: 20,
  MEMBERS_PER_TEAM: 4,
  SAME_DAY_SETTINGS: {
    RESERVED_THREE_PERSON_TEAMS: 2,
    GENERIC_COOL_PRIORITY: [2, 3, 4],
    HIGHLIGHT_COLOR: '#fff2cc'
  },
  PASSWORD_LENGTH: 4,
  MAIL_DOMAIN: '@example.ac.jp',
  INITIAL_PASSWORD_SETTINGS: {
    ENABLED: true,
    SHEET_NAME: '初回パスワード送信',
    BATCH_SIZE: 80,
    KEEP_QUOTA: 20,
    RETRY_FAILED_FIRST: true,
    SKIP_ALREADY_ISSUED: true,
    ALLOW_NO_NAME: true,
    SEND_SCHEDULE: [
      { at: '2026/09/29 12:00' },
      { at: '2026/09/30 12:05' },
      { at: '2026/10/01 12:10' }
    ]
  },
  SHEETS: {
    COOL_RESPONSES: 'クール申請フォーム',
    PASSWORD_RESPONSES: 'パスワードフォーム',
    VALID: '有効申請',
    INVALID: '無効申請',
    SAME_DAY: '当日申請',
    BC: 'BC参加者',
    MASTER: '学籍・パスワード一覧',
    PASSWORD_LOG: 'パスワードログ',
    GROUP_CHECK: 'グループ分け確認修正用'
  },
  STUDENT_SHEETS: {
    ROSTER: 'クール分け',
    GROUPS: 'グループ分け'
  },
  HEADERS: {
    TS: 'タイムスタンプ',
    ID: '学籍番号',
    PASSWORD: 'パスワード',
    PREF: '希望内容',
    NAME: '氏名',
    REASON: 'ベーシッククラスに参加しようと思った理由を記述してください。',
    FREE: 'わからなかったところ'
  },
  PREF_VALUE: {
    COOL1: '第1クール希望',
    COOL2: '第2クール希望',
    COOL3: '第3クール希望',
    COOL4: '第4クール希望',
    BC: 'BC（ベーシック）希望'
  },
  LABELS: {
    BC: 'BC',
    REAPPLY: '再度申請',
    MANUAL: '手動割り当て'
  },
  WEEKLY_SCHEDULE: {
    coolFormOpen: { enabled: true, day: 5, hour: 12, minute: 15 },
    coolFormClose: { enabled: true, day: 4, hour: 21, minute: 0 },
    passwordFormOpen: { enabled: false, day: 5, hour: 12, minute: 15 },
    passwordFormClose: { enabled: false, day: 4, hour: 12, minute: 15 },
    makeRandomGroups: { enabled: true, day: 4, hour: 21, minute: 1 },
    groupPublish: { enabled: true, day: 4, hour: 22, minute: 0 },
    reset: { enabled: true, day: 5, hour: 11, minute: 50 }
  }
};

// キーのパス（例: 'WEEKLY_SCHEDULE.reset'）ごとの、前の行のコメントと、行末のコメント。
// before の '' は空行。
const CONFIG_NOTES = {
  'COURSE_NAME': { before: ['// メール件名・本文に入る授業名'] },
  'ADMIN_SPREADSHEET_ID': {
    before: ['', '// ===== スプレッドシート =====', '// 管理用スプレッドシートは、このスクリプトを紐づけたスプレッドシート自身を使うため設定不要'],
    after: '// Form_GAS'
  },
  'STUDENT_SPREADSHEET_ID': {
    before: ['', '// 学生共有用スプレッドシートのID', '// URL https://docs.google.com/spreadsheets/d/xxxxx/edit の xxxxx を入れる']
  },
  'STUDENT_ROSTER_SHEET_GID': {
    before: ['', '// 学生共有用スプレッドシートの「クール分け」シートのgid', '// そのシートを開いたときの URL 末尾 #gid=nnnn の nnnn（数値）を入れる。最初のシートなら通常 0']
  },
  'COOL_FORM_ID': {
    before: ['', '// ===== フォームID =====', '// フォームの編集画面の URL https://docs.google.com/forms/d/xxxxx/edit の xxxxx を入れる', '// （回答用の /forms/d/e/... の URL ではないので注意）'],
    after: '// グループワーク申請（クール申請）フォーム'
  },
  'PASSWORD_FORM_ID': { after: '// パスワード発行フォーム' },
  'TOTAL_COOLS': { before: ['', '// ===== クール・チーム設定 ====='], after: '// 3 or 4' },
  'MEMBERS_PER_TEAM': { after: '// 1クール定員 = TEAMS_PER_COHORT * MEMBERS_PER_TEAM' },
  'SAME_DAY_SETTINGS': { before: ['', '// ===== 当日申請設定 ====='] },
  'SAME_DAY_SETTINGS.RESERVED_THREE_PERSON_TEAMS': {
    before: ['// GENERIC_COOL_PRIORITY で指定したクールごとに確保を目指す3人チーム数']
  },
  'SAME_DAY_SETTINGS.GENERIC_COOL_PRIORITY': {
    before: ['// 当日申請の配置対象・優先順。例: [2, 3, 4] なら第2→第3→第4の順']
  },
  'SAME_DAY_SETTINGS.HIGHLIGHT_COLOR': {
    before: ['// 当日申請によって追加・移動した学籍番号の背景色']
  },
  'PASSWORD_LENGTH': { before: ['', '// ===== パスワード設定 ====='] },
  'MAIL_DOMAIN': { before: ['// パスワードの送信先は「学籍番号 + MAIL_DOMAIN」で作られる。@ から書く'] },
  'INITIAL_PASSWORD_SETTINGS': {
    before: ['', '// ===== 初回パスワード分割送信設定 =====', '// 授業開始前に「初回パスワード送信」シートの名簿へ初回パスワードを事前配布する。', '// 再発行は従来どおりパスワードフォームを使う。']
  },
  'INITIAL_PASSWORD_SETTINGS.BATCH_SIZE': {
    before: [''],
    after: '// 各回の標準送信件数（一般アカウントの上限100通/日に対し予備を残す）'
  },
  'INITIAL_PASSWORD_SETTINGS.KEEP_QUOTA': { after: '// 他用途に残す送信枠' },
  'INITIAL_PASSWORD_SETTINGS.RETRY_FAILED_FIRST': { after: '// 送信失敗者を先に再送してから未送信者を送る' },
  'INITIAL_PASSWORD_SETTINGS.SKIP_ALREADY_ISSUED': { after: '// マスタで発行済み（発行回数≥1）の学生を対象外にする' },
  'INITIAL_PASSWORD_SETTINGS.ALLOW_NO_NAME': { after: '// 氏名が空でも学籍番号だけで送信する' },
  'INITIAL_PASSWORD_SETTINGS.SEND_SCHEDULE': {
    before: ['', '// JST。先頭から順に使い、毎回「次回分だけ」トリガーを1個予約する。', '// count 省略時は BATCH_SIZE 件。開始時点で過去の日時は自動スキップ。', '// メール送信枠は、最初に送った時刻から24時間後にリセットされる（0時ではない）。', '// 前日と同じ時刻だと枠が戻りきらないことがあるため、日ごとに5分ずつ遅らせて入れる。', "// batchを効かせたい時の例   { at: '2026/09/28 02:40', count: 5 }"]
  },
  'SHEETS': {
    before: ['', '// ===== API設定 =====', "// PASSWORD_API_URL: '',", '', '// ===== フォーム回答シート名 =====']
  },
  'SHEETS.SAME_DAY': { after: '// 当日申請フォームの回答先、または当日申請者リスト貼り付け用' },
  'STUDENT_SHEETS': { before: ['', '// ===== 学生共有用シート名 ====='] },
  'HEADERS': { before: ['', '// ===== フォーム見出し（実際の質問文に合わせる） ====='] },
  'PREF_VALUE': { before: ['', '// ===== 希望内容の選択肢（フォームの選択肢と一致させる） ====='] },
  'LABELS': { before: ['', '// ===== 表示ラベル ====='] },
  'WEEKLY_SCHEDULE': {
    before: ['', '// ===== 週次スケジュール（JST）=====', '// day: 0=日,1=月,2=火, 3=水, 4=木, 5=金, 6=土']
  },
  'WEEKLY_SCHEDULE.coolFormOpen': { before: ['// クール申請フォーム'] },
  'WEEKLY_SCHEDULE.passwordFormOpen': {
    before: ['', '// パスワードフォーム', '// 常時開放したいなら enabled:false にする']
  },
  'WEEKLY_SCHEDULE.makeRandomGroups': { before: ['', '// グループ分け（確認修正用シートへの出力）'] },
  'WEEKLY_SCHEDULE.groupPublish': { before: ['', '// グループ公開（確認修正用→学生共有用）'] },
  'WEEKLY_SCHEDULE.reset': { before: ['', '// 初期化'] }
};

// 最終的な CONFIG オブジェクトを、本体と同じ形の「const CONFIG = {...};」のコードにする。
function renderConfigSource_(config) {
  const stamp = Utilities.formatDate(new Date(), SETUP.TIME_ZONE, 'yyyy/MM/dd HH:mm');
  const course = String(SETUP.COURSE_NAME).replace(/\*\//g, '* /');
  const out = [
    '/*************************************************',
    ' *  授業ごとの差分は基本ここだけ変更',
    ` *  （course-setup が出力。科目: ${course} / 出力: ${stamp} / テンプレート版 ${CONFIG_TEMPLATE_VERSION}）`,
    ' *************************************************/',
    'const CONFIG = {'
  ];
  for (const key of Object.keys(config)) {
    renderConfigEntry_(out, key, config[key], 1, key);
  }
  out.push('};');
  return out.join('\n');
}

function renderConfigEntry_(out, key, value, depth, path) {
  const pad = '  '.repeat(depth);
  const note = CONFIG_NOTES[path] || {};
  for (const line of (note.before || [])) out.push(line === '' ? '' : pad + line);

  let trailing = note.after ? ' ' + note.after : '';
  const name = /^[A-Za-z_$][\w$]*$/.test(key) ? key : configLiteral_(key);

  if (path === 'ADMIN_SPREADSHEET_ID') {
    out.push(`${pad}${name}: SpreadsheetApp.getActive().getId(),${trailing}`);
    return;
  }

  // 週次スケジュールの各行には、曜日と時刻のコメントを付ける
  if (path.indexOf('WEEKLY_SCHEDULE.') === 0 && isPlainObject_(value) && 'day' in value) {
    const hh = String(value.hour).padStart(2, '0');
    const mm = String(value.minute).padStart(2, '0');
    trailing = ` // ${SETUP_DAY_NAMES[value.day]} ${hh}:${mm}`;
  }

  if (Array.isArray(value)) {
    if (value.every(v => !isPlainObject_(v) && !Array.isArray(v))) {
      out.push(`${pad}${name}: [${value.map(configLiteral_).join(', ')}],${trailing}`);
    } else {
      out.push(`${pad}${name}: [`);
      for (const item of value) out.push(`${pad}  ${configInline_(item)},`);
      out.push(`${pad}],${trailing}`);
    }
    return;
  }

  if (isPlainObject_(value)) {
    const allPrimitive = Object.keys(value).every(k => !isPlainObject_(value[k]) && !Array.isArray(value[k]));
    if (depth >= 2 && allPrimitive) {
      out.push(`${pad}${name}: ${configInline_(value)},${trailing}`);
      return;
    }
    out.push(`${pad}${name}: {`);
    for (const childKey of Object.keys(value)) {
      renderConfigEntry_(out, childKey, value[childKey], depth + 1, `${path}.${childKey}`);
    }
    out.push(`${pad}},${trailing}`);
    return;
  }

  out.push(`${pad}${name}: ${configLiteral_(value)},${trailing}`);
}

function configInline_(v) {
  if (!isPlainObject_(v)) return configLiteral_(v);
  const parts = Object.keys(v).map(k => {
    const name = /^[A-Za-z_$][\w$]*$/.test(k) ? k : configLiteral_(k);
    return `${name}: ${configLiteral_(v[k])}`;
  });
  return `{ ${parts.join(', ')} }`;
}

function configLiteral_(v) {
  if (typeof v === 'string') {
    return "'" + v.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, '\\n') + "'";
  }
  return String(v);
}

// 出力したコードを実行せずに構文だけ確かめ、元の config と同じ内容になるかを調べる。
// 作成を始める前に、ダミーの ID で呼ぶ。食い違っていたら、ファイルを作らずに止める。
function assertConfigSourceRoundTrip_(config, source) {
  let evaluated;
  try {
    const fakeSpreadsheetApp = { getActive: () => ({ getId: () => 'ADMIN_ID' }) };
    evaluated = new Function('SpreadsheetApp', source + '\n;return CONFIG;')(fakeSpreadsheetApp);
  } catch (e) {
    if (e instanceof SyntaxError) {
      throw new Error('出力する CONFIG のコードに構文エラーがあります: ' + e);
    }
    return; // 構文エラー以外の理由で確認できない場合は、確認を省略する
  }

  const normalize = (obj) => {
    const copy = JSON.parse(JSON.stringify(obj));
    delete copy.ADMIN_SPREADSHEET_ID;
    return stableJson_(copy);
  };
  if (normalize(evaluated) !== normalize(config)) {
    throw new Error('出力する CONFIG のコードが、設定の内容と一致しません（出力処理の不具合です）。');
  }
}

function stableJson_(v) {
  if (Array.isArray(v)) return '[' + v.map(stableJson_).join(',') + ']';
  if (isPlainObject_(v)) {
    return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + stableJson_(v[k])).join(',') + '}';
  }
  return JSON.stringify(v);
}

function writeConfigCodeSheet_(ss, source) {
  let sh = ss.getSheetByName('設定');
  if (!sh) sh = ss.insertSheet('設定');
  sh.clear();

  sh.getRange('A1').setValue('本体コードの CONFIG（コピーして、本体コードに貼り付ける）').setFontWeight('bold');
  sh.getRange('A2')
    .setValue(
      '使い方：① 下の A4 のセルをダブルクリックして編集状態にする → ② Ctrl+A（全選択）→ Ctrl+C（コピー）→ ' +
      '③ 拡張機能 → Apps Script で main.js を開き、冒頭の「const CONFIG = {...};」（バナーコメントから「};」まで）を選択して貼り付け、保存する'
    )
    .setWrap(true);
  sh.getRange('A3')
    .setValue('※ セルを選んだだけでコピーすると、先頭と末尾に " が付き、文中の " が二重になります。必ず、ダブルクリックして編集状態にしてからコピーしてください。')
    .setWrap(true);

  sh.getRange('A4')
    .setNumberFormat('@')
    .setValue(source)
    .setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP)
    .setVerticalAlignment('top')
    .setFontFamily('Roboto Mono');
  sh.setColumnWidth(1, 900);
  sh.setRowHeight(4, 320);
}


/*************************************************
 *  共有・検証・レポート
 *************************************************/
function resolveFolder_() {
  if (SETUP.FOLDER_ID) return DriveApp.getFolderById(SETUP.FOLDER_ID);
  if (SETUP.SAME_FOLDER_AS_SCRIPT) {
    const parents = DriveApp.getFileById(ScriptApp.getScriptId()).getParents();
    if (!parents.hasNext()) {
      throw new Error('このスクリプトの親フォルダを取得できませんでした。FOLDER_ID を指定するか、SAME_FOLDER_AS_SCRIPT を false にしてください。');
    }
    return parents.next();
  }
  if (SETUP.FOLDER_NAME) return DriveApp.createFolder(SETUP.FOLDER_NAME);
  return null;
}

function applyStudentSharing_(studentSpreadsheetId) {
  const file = DriveApp.getFileById(studentSpreadsheetId);
  if (SETUP.STUDENT_SHARING === 'DOMAIN_WITH_LINK') {
    file.setSharing(DriveApp.Access.DOMAIN_WITH_LINK, DriveApp.Permission.VIEW);
  } else if (SETUP.STUDENT_SHARING === 'ANYONE_WITH_LINK') {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  }
}

function validateSetup_() {
  const name = String(SETUP.COURSE_NAME || '').trim();
  if (!name || name === 'ここに科目名') {
    throw new Error('SETUP.COURSE_NAME に科目名を設定してください。');
  }
  const cools = Number(SETUP.OVERRIDES.TOTAL_COOLS);
  if (cools !== 3 && cools !== 4) {
    throw new Error('SETUP.OVERRIDES.TOTAL_COOLS は 3 か 4 にしてください。');
  }
  if (!['NONE', 'DOMAIN_WITH_LINK', 'ANYONE_WITH_LINK'].includes(SETUP.STUDENT_SHARING)) {
    throw new Error('SETUP.STUDENT_SHARING は NONE / DOMAIN_WITH_LINK / ANYONE_WITH_LINK のいずれかです。');
  }
  const reserved = ['COOL_FORM_ID', 'PASSWORD_FORM_ID', 'STUDENT_SPREADSHEET_ID', 'STUDENT_ROSTER_SHEET_GID', 'ADMIN_SPREADSHEET_ID'];
  const clash = reserved.filter(k => k in SETUP.OVERRIDES);
  if (clash.length) {
    throw new Error(`OVERRIDES に自動設定されるキーがあります: ${clash.join(', ')}`);
  }

  const unknownKeys = Object.keys(SETUP.OVERRIDES).filter(k => !(k in CONFIG_DEFAULTS));
  if (unknownKeys.length) {
    throw new Error(`OVERRIDES に、本体の CONFIG にないキーがあります: ${unknownKeys.join(', ')}`);
  }

  const mailDomain = String(SETUP.OVERRIDES.MAIL_DOMAIN || '').trim();
  if (mailDomain.charAt(0) !== '@' || mailDomain === '@example.ac.jp') {
    throw new Error('SETUP.OVERRIDES.MAIL_DOMAIN に、学生のメールアドレスのドメイン（@ から始める）を設定してください。');
  }

  // SCHEDULE から自動で決まる週次項目を OVERRIDES で重ねて指定すると、文言と食い違うため禁止する
  const weeklyOverride = SETUP.OVERRIDES.WEEKLY_SCHEDULE || {};
  const autoKeys = Object.keys(buildWeeklySchedule_());
  const weeklyClash = autoKeys.filter(k => k in weeklyOverride);
  if (weeklyClash.length) {
    throw new Error(`OVERRIDES.WEEKLY_SCHEDULE の ${weeklyClash.join(', ')} は SCHEDULE から自動設定されます。SCHEDULE を変更してください。`);
  }

  for (const key of ['OPEN', 'CLOSE', 'PUBLISH']) {
    const t = SETUP.SCHEDULE[key];
    const ok = t && Number.isInteger(t.day) && t.day >= 0 && t.day <= 6 &&
      Number.isInteger(t.hour) && t.hour >= 0 && t.hour <= 23 &&
      Number.isInteger(t.minute) && t.minute >= 0 && t.minute <= 59;
    if (!ok) {
      throw new Error(`SETUP.SCHEDULE.${key} は day(0〜6)・hour(0〜23)・minute(0〜59) の整数で指定してください。`);
    }
  }
  const badOrder = SETUP.SHEET_ORDER.filter(k => !resolveSheetOrderName_(k));
  if (badOrder.length) {
    throw new Error(`SETUP.SHEET_ORDER に未知のキーがあります: ${badOrder.join(', ')}（SHEET_NAMES のキーか 'SETTINGS' を指定）`);
  }
  for (const key of ['MAKE_GROUPS_AFTER_CLOSE_MIN', 'RESET_BEFORE_OPEN_MIN']) {
    if (!Number.isInteger(SETUP.SCHEDULE[key]) || SETUP.SCHEDULE[key] < 0) {
      throw new Error(`SETUP.SCHEDULE.${key} は 0 以上の整数（分）で指定してください。`);
    }
  }

  // 出力する CONFIG のコードを、ダミーの ID で組み立てて確かめる（ファイルを作る前に失敗させる）
  const dryConfig = buildFinalConfig_({
    studentSpreadsheetId: 'DRY_RUN',
    rosterGid: 0,
    coolFormId: 'DRY_RUN',
    passwordFormId: 'DRY_RUN',
    prefChoices: buildPrefChoices_(cools)
  });
  assertConfigSourceRoundTrip_(dryConfig, renderConfigSource_(dryConfig));
}

function isPlainObject_(x) {
  return x !== null && typeof x === 'object' && !Array.isArray(x);
}

function buildSetupReport_(r) {
  return [
    `✅ 「${SETUP.COURSE_NAME}」のセットアップが完了しました。`,
    '',
    `管理用スプレッドシート : ${r.admin}`,
    `学生共有用スプレッドシート: ${r.student}`,
    `クール申請フォーム（編集）: ${r.coolFormEdit}`,
    `クール申請フォーム（回答用）: ${r.coolFormPublished}`,
    `パスワード再発行フォーム（編集）: ${r.passwordFormEdit}`,
    `パスワード再発行フォーム（回答用）: ${r.passwordFormPublished}`,
    '',
    '【フォームの手動確認】Apps Script では設定できない項目があります',
    '・クール申請フォーム → 設定 → 「メールアドレスを収集する」を「確認済み」に変更する',
    '  （作成直後は「回答者からの入力」になっている。確認済みにすると、回答者は Google ログインが必要）',
    '・クール申請フォーム → 設定 → 「回答のコピーを回答者に送信」を「常に表示」にする',
    '・説明文の太字は Apps Script で付けられないため、編集画面で手動で付ける（下記）',
    '  クール申請: 回答期間：/ 決定方法：/ 先着順 / 注意事項：/ 「毎週必ず申請…確認してください。」/',
    '              「申請は一度しかすることができません。」/ 公開スケジュール：/ クール分け：/ グループ分け：/',
    '              学生共有スプレッドシート（…）/ パスワード忘れForm',
    '  パスワード再発行: 学校のメールアドレス宛 / 迷惑メールも確認してください。/',
    '              以前のパスワードは使用できなくなります。/ グループワーク・BC申請Formから希望クールの申請を行ってください。',
    '',
    '【次の手順】',
    '1. 管理用スプレッドシートの「設定」シートを開く。A4 のセルをダブルクリックして編集状態にし、',
    '   Ctrl+A（全選択）→ Ctrl+C（コピー）する（選んだだけでコピーすると、" が二重になる）',
    '2. 拡張機能 → Apps Script を開き、main.js の内容を貼り付ける',
    '3. 貼り付けたコードの冒頭の「const CONFIG = {...};」（バナーコメントから「};」まで）を、1 でコピーしたコードに置き換えて保存する',
    '4. スプレッドシートを再読み込みし、「自動化メニュー」が出たら権限を承認する',
    '5. ①フォーム送信 →「送信トリガーを有効化」を実行する',
    '6. ②週次スケジュール →「週次スケジュール登録」を実行する',
    '※必要シートは作成済みなので、本体側での初期設定は不要です。',
    '',
    '※クール申請フォームは受付停止で作成しています。停止中は「回答期間は…です。」のメッセージが表示され、',
    '  週次スケジュール登録後は、SCHEDULE の開始時刻に自動で開きます。',
    '※同じ設定で再実行すると、同名のファイルがもう1セット作られます。'
  ].join('\n');
}
