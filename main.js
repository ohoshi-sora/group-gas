/*************************************************
 *  授業ごとの差分は基本ここだけ変更
 *************************************************/
const CONFIG = {
  // メール件名・本文に入る授業名
  COURSE_NAME: 'YOUR_COURSE_NAME',

  // ===== スプレッドシート =====
  // 管理用スプレッドシートは、このスクリプトを紐づけたスプレッドシート自身を使うため設定不要
  ADMIN_SPREADSHEET_ID: SpreadsheetApp.getActive().getId(), // Form_GAS

  // 学生共有用スプレッドシートのID
  // URL https://docs.google.com/spreadsheets/d/xxxxx/edit の xxxxx を入れる
  STUDENT_SPREADSHEET_ID: 'YOUR_STUDENT_SPREADSHEET_ID',

  // 学生共有用スプレッドシートの「クール分け」シートのgid
  // そのシートを開いたときの URL 末尾 #gid=nnnn の nnnn（数値）を入れる。最初のシートなら通常 0
  STUDENT_ROSTER_SHEET_GID: 0,

  // ===== フォームID =====
  // フォームの編集画面の URL https://docs.google.com/forms/d/xxxxx/edit の xxxxx を入れる
  // （回答用の /forms/d/e/... の URL ではないので注意）
  COOL_FORM_ID: 'YOUR_COOL_FORM_ID',         // グループワーク申請（クール申請）フォーム
  PASSWORD_FORM_ID: 'YOUR_PASSWORD_FORM_ID', // パスワード発行フォーム

  // ===== クール・チーム設定 =====
  TOTAL_COOLS: 4, // 3 or 4
  TEAMS_PER_COHORT: 20,
  MEMBERS_PER_TEAM: 4, // 1クール定員 = TEAMS_PER_COHORT * MEMBERS_PER_TEAM

  // ===== 当日申請設定 =====
  SAME_DAY_SETTINGS: {
    // GENERIC_COOL_PRIORITY で指定したクールごとに確保を目指す3人チーム数
    RESERVED_THREE_PERSON_TEAMS: 2,
    // 当日申請の配置対象・優先順。例: [2, 3, 4] なら第2→第3→第4の順
    GENERIC_COOL_PRIORITY: [2, 3, 4],
    // 当日申請によって追加・移動した学籍番号の背景色
    HIGHLIGHT_COLOR: '#fff2cc'
  },

  // ===== パスワード設定 =====
  PASSWORD_LENGTH: 4,
  // パスワードの送信先は「学籍番号 + MAIL_DOMAIN」で作られる。@ から書く
  MAIL_DOMAIN: '@example.ac.jp',

  // ===== 初回パスワード分割送信設定 =====
  // 授業開始前に「初回パスワード送信」シートの名簿へ初回パスワードを事前配布する。
  // 再発行は従来どおりパスワードフォームを使う。
  INITIAL_PASSWORD_SETTINGS: {
    ENABLED: true,
    SHEET_NAME: '初回パスワード送信',

    BATCH_SIZE: 80,            // 各回の標準送信件数（一般アカウントの上限100通/日に対し予備を残す）
    KEEP_QUOTA: 20,            // 他用途に残す送信枠
    RETRY_FAILED_FIRST: true,  // 送信失敗者を先に再送してから未送信者を送る
    SKIP_ALREADY_ISSUED: true, // マスタで発行済み（発行回数≥1）の学生を対象外にする
    ALLOW_NO_NAME: true,       // 氏名が空でも学籍番号だけで送信する

    // JST。先頭から順に使い、毎回「次回分だけ」トリガーを1個予約する。
    // count 省略時は BATCH_SIZE 件。開始時点で過去の日時は自動スキップ。
    // batchを効かせたい時の例   { at: '2026/09/28 02:40', count: 5 }
    SEND_SCHEDULE: [
      { at: '2026/09/29 12:00' },
      { at: '2026/09/30 12:00' },
      { at: '2026/10/01 12:00' }
    ]
  },

  // ===== API設定 =====
  // PASSWORD_API_URL: '',

// ===== フォーム回答シート名 =====
  SHEETS: {
    COOL_RESPONSES: 'クール申請フォーム',
    PASSWORD_RESPONSES: 'パスワードフォーム',
    VALID: '有効申請',
    INVALID: '無効申請',
    SAME_DAY: '当日申請',// 当日申請フォームの回答先、または当日申請者リスト貼り付け用
    BC: 'BC参加者',
    MASTER: '学籍・パスワード一覧',
    PASSWORD_LOG: 'パスワードログ',
    GROUP_CHECK: 'グループ分け確認修正用'
  },

  // ===== 学生共有用シート名 =====
  STUDENT_SHEETS: {
    ROSTER: 'クール分け',
    GROUPS: 'グループ分け'
  },

  // ===== フォーム見出し（実際の質問文に合わせる） =====
  HEADERS: {
    TS: 'タイムスタンプ',
    ID: '学籍番号',
    PASSWORD: 'パスワード',
    PREF: '希望内容',
    NAME: '氏名',
    REASON: 'ベーシッククラスに参加しようと思った理由を記述してください。',
    FREE: 'わからなかったところ'
  },

  // ===== 希望内容の選択肢（フォームの選択肢と一致させる） =====
  PREF_VALUE: {
    COOL1: '第1クール希望',
    COOL2: '第2クール希望',
    COOL3: '第3クール希望',
    COOL4: '第4クール希望',
    BC: 'BC（ベーシック）希望'
  },

  // ===== 表示ラベル =====
  LABELS: {
    BC: 'BC',
    REAPPLY: '再度申請',
    MANUAL: '手動割り当て'
  },

  // ===== 週次スケジュール（JST）=====
  // day: 0=日,1=月,2=火, 3=水, 4=木, 5=金, 6=土
  WEEKLY_SCHEDULE: {
    // クール申請フォーム
    coolFormOpen:  { enabled: true, day: 5, hour: 12, minute: 15 }, // 金 12:15
    coolFormClose: { enabled: true, day: 4, hour: 21, minute: 00 }, // 木 21:00

    // パスワードフォーム
    // 常時開放したいなら enabled:false にする
    passwordFormOpen:  { enabled: false, day: 5, hour: 12, minute: 15 },
    passwordFormClose: { enabled: false, day: 4, hour: 12, minute: 15 },

    // グループ分け（確認修正用シートへの出力）
    makeRandomGroups: { enabled: true, day: 4, hour: 21, minute: 01 }, // 木 21:01（締切の1分後）

    // グループ公開（確認修正用→学生共有用）
    groupPublish: { enabled: true, day: 4, hour: 22, minute: 00 }, // 木 22:00

    // 初期化
    reset: { enabled: true, day: 5, hour: 11, minute: 50 } // 金 11:50
  }
};


/*************************************************
 *  定数
 *************************************************/
const DAY_NAMES = ['日','月','火','水','木','金','土'];

const MASTER_HEADERS = [
  CONFIG.HEADERS.ID,
  CONFIG.HEADERS.NAME,
  'メールアドレス',
  'パスワード',
  '発行回数',
  '初回発行日時',
  '最終発行日時',
  '有効'
];

const VALID_HEADERS = [
  CONFIG.HEADERS.TS,
  CONFIG.HEADERS.ID,
  CONFIG.HEADERS.PASSWORD,
  CONFIG.HEADERS.PREF,
  CONFIG.HEADERS.NAME,
  CONFIG.HEADERS.REASON,
  CONFIG.HEADERS.FREE,
  '受付種別',
  '備考',
  'ステータス'
];

const INVALID_HEADERS = [
  CONFIG.HEADERS.TS,
  CONFIG.HEADERS.ID,
  CONFIG.HEADERS.PASSWORD,
  CONFIG.HEADERS.PREF,
  CONFIG.HEADERS.NAME,
  CONFIG.HEADERS.REASON,
  CONFIG.HEADERS.FREE,
  '無効理由',
  '備考'
];

const PASSWORD_LOG_HEADERS = [
  CONFIG.HEADERS.TS,
  CONFIG.HEADERS.ID,
  CONFIG.HEADERS.NAME,
  'メールアドレス',
  'パスワード',
  '種別',
  '結果',
  '備考'
];

const BC_HEADERS = [
  CONFIG.HEADERS.ID,
  CONFIG.HEADERS.NAME,
  '参加理由',
  'わからなかったところ'
];

const SAME_DAY_HEADERS = [
  CONFIG.HEADERS.TS,
  CONFIG.HEADERS.ID,
  CONFIG.HEADERS.PREF,
  'BCに参加する学生はBCに参加する理由を書いてください',
  '処理結果',
  '配置先',
  '備考',
  '処理日時'
];

const INITIAL_PASSWORD_HEADERS = [
  CONFIG.HEADERS.ID,
  CONFIG.HEADERS.NAME,
  'メールアドレス',
  'パスワード',
  '送信状態',
  '送信日時',
  '試行回数',
  'エラー内容'
];

// 「初回パスワード送信」シートの列番号（1 始まり）
const INITIAL_PW_COLS = {
  ID: 1, NAME: 2, EMAIL: 3, PASSWORD: 4,
  STATUS: 5, SENT_AT: 6, ATTEMPTS: 7, ERROR: 8
};

const INITIAL_PW_STATUS = {
  PENDING: '未送信',
  SENT: '送信済み',
  FAILED: '送信失敗',
  SKIPPED: '対象外'
};

const PROP_KEYS = {
  COOL_OPEN_TRIGGER_ID: 'COOL_FORM_OPEN_TRIGGER_ID',
  COOL_CLOSE_TRIGGER_ID: 'COOL_FORM_CLOSE_TRIGGER_ID',
  PASS_OPEN_TRIGGER_ID: 'PASS_FORM_OPEN_TRIGGER_ID',
  PASS_CLOSE_TRIGGER_ID: 'PASS_FORM_CLOSE_TRIGGER_ID',
  MAKE_RANDOM_GROUPS_TRIGGER_ID: 'MAKE_RANDOM_GROUPS_TRIGGER_ID',
  GROUP_PUBLISH_TRIGGER_ID: 'GROUP_PUBLISH_TRIGGER_ID',
  RESET_TRIGGER_ID: 'RESET_TRIGGER_ID',

  COOL_OPEN_AT: 'COOL_FORM_OPEN_AT',
  COOL_CLOSE_AT: 'COOL_FORM_CLOSE_AT',
  PASS_OPEN_AT: 'PASS_FORM_OPEN_AT',
  PASS_CLOSE_AT: 'PASS_FORM_CLOSE_AT',
  MAKE_RANDOM_GROUPS_AT: 'MAKE_RANDOM_GROUPS_AT',
  GROUP_PUBLISH_AT: 'GROUP_PUBLISH_AT',
  RESET_AT: 'RESET_AT',

  INITIAL_PW_TRIGGER_ID: 'INITIAL_PW_TRIGGER_ID',
  INITIAL_PW_SCHEDULE_INDEX: 'INITIAL_PW_SCHEDULE_INDEX',
  INITIAL_PW_STARTED_AT: 'INITIAL_PW_STARTED_AT',

  WEEKLY_SETTINGS: 'WEEKLY_AUTOMATION_SETTINGS'
};


/*************************************************
 *  メニュー
 *************************************************/
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('自動化メニュー')
    .addSubMenu(
      SpreadsheetApp.getUi().createMenu('①フォーム送信')
        .addItem('送信トリガーを有効化⭐️', 'enableOnSubmitTrigger')
        .addItem('送信トリガーを無効化', 'disableOnSubmitTriggers')
    )
    .addSubMenu(
      SpreadsheetApp.getUi().createMenu('②週次スケジュール')
        .addItem('週次スケジュール登録⭐️', 'createWeeklyAutomation')
        .addItem('週次スケジュール解除', 'cancelWeeklyAutomation')
        .addItem('登録状況を表示', 'showWeeklyAutomationStatus')
    )
    .addSubMenu(
      SpreadsheetApp.getUi().createMenu('③初回パスワード送信')
        .addItem('名簿シートを準備', 'prepareInitialPasswordSheet')
        .addItem('分割送信を開始（次回分を予約）⭐️', 'startInitialPasswordDistribution')
        .addItem('今すぐ1回分を送信', 'sendInitialPasswordsNow')
        .addItem('送信状況を表示', 'showInitialPasswordStatus')
        .addItem('分割送信を中止', 'cancelInitialPasswordDistribution')
    )
    .addSubMenu(
      SpreadsheetApp.getUi().createMenu('④クール分け')
        .addItem('今すぐクール分け・BCを更新', 'updateRostersNow')
    )
    .addSubMenu(
      SpreadsheetApp.getUi().createMenu('⑤グループ分け')
        .addItem('確認修正用グループを生成', 'makeRandomGroups')
        .addItem('今すぐ学生に公開', 'publishGroupsNow')
        .addItem('公開予約（設定値より自動設定）', 'scheduleGroupPublishFromConfig')
        .addItem('公開予約を確認', 'showGroupPublishSchedule')
        .addItem('公開予約を取消', 'cancelGroupPublishSchedule')
    )
    .addSubMenu(
      SpreadsheetApp.getUi().createMenu('⑥フォーム受付')
        .addItem('受付開始/締切を手動予約', 'promptScheduleFormsWindow')
        .addItem('受付予約状況を表示', 'showFormWindowSchedule')
        .addItem('クール申請フォームを今すぐ開く', 'openCoolFormNow')
        .addItem('クール申請フォームを今すぐ閉じる', 'closeCoolFormNow')
        .addItem('パスワードフォームを今すぐ開く', 'openPasswordFormNow')
        .addItem('パスワードフォームを今すぐ閉じる', 'closePasswordFormNow')
        .addItem('フォーム予約をすべて取消', 'cancelAllFormSchedules')
    )
    .addSubMenu(
      SpreadsheetApp.getUi().createMenu('⑦当日申請')
        .addItem('当日申請シートを準備', 'prepareSameDayApplicationsSheet')
        .addItem('当日申請を空き枠へ反映⭐️ 1', 'applySameDayApplicationsNow')
        .addItem('今すぐ学生に公開⭐️ 2', 'publishGroupsNow')
    )
    .addSubMenu(
      SpreadsheetApp.getUi().createMenu('⑧その他')
        .addItem('必要シートを作成/更新（手作業で作る場合）', 'initializeManagedSheets')
        .addItem('全データ初期化（クール申請のみ回答削除）', 'resetAllData')
    )

    .addToUi();
}


/*************************************************
 *  初期設定
 *************************************************/
function initializeManagedSheets() {
  const adminSS = SpreadsheetApp.openById(CONFIG.ADMIN_SPREADSHEET_ID);
  ensureSheetHeader_(adminSS, CONFIG.SHEETS.VALID, VALID_HEADERS);
  ensureSheetHeader_(adminSS, CONFIG.SHEETS.INVALID, INVALID_HEADERS);
  ensureSameDayApplicationSheet_();
  ensureSheetHeader_(adminSS, CONFIG.SHEETS.MASTER, MASTER_HEADERS);
  ensureSheetHeader_(adminSS, CONFIG.SHEETS.PASSWORD_LOG, PASSWORD_LOG_HEADERS);
  ensureSheetHeader_(adminSS, CONFIG.SHEETS.BC, BC_HEADERS);
  ensureSheetHeader_(adminSS, CONFIG.SHEETS.GROUP_CHECK, []);
  ensureInitialPasswordHeader_(getInitialPasswordSheet_(true));

  const studentSS = SpreadsheetApp.openById(CONFIG.STUDENT_SPREADSHEET_ID);
  const roster = getStudentRosterSheet_();
  writeRoster_(roster, ...emptyBuckets_());

  let groupSheet = studentSS.getSheetByName(CONFIG.STUDENT_SHEETS.GROUPS);
  if (!groupSheet) groupSheet = studentSS.insertSheet(CONFIG.STUDENT_SHEETS.GROUPS);
  resetStudentGroupSheet_();

  SpreadsheetApp.getUi().alert('必要シートの準備が完了しました。');
}


/*************************************************
 *  トリガー
 *************************************************/
function enableOnSubmitTrigger() {
  disableOnSubmitTriggers();
  ScriptApp.newTrigger('onAnyFormSubmit')
    .forSpreadsheet(CONFIG.ADMIN_SPREADSHEET_ID)
    .onFormSubmit()
    .create();
  SpreadsheetApp.getUi().alert('フォーム送信トリガーを有効化しました。');
}

function disableOnSubmitTriggers() {
  for (const t of ScriptApp.getProjectTriggers()) {
    const isForSource = t.getTriggerSourceId && t.getTriggerSourceId() === CONFIG.ADMIN_SPREADSHEET_ID;
    const isOnSubmit = t.getEventType && t.getEventType() === ScriptApp.EventType.ON_FORM_SUBMIT;
    const isOurFunc = ['onAnyFormSubmit'].includes(t.getHandlerFunction());
    if (isForSource && isOnSubmit && isOurFunc) {
      ScriptApp.deleteTrigger(t);
    }
  }
}

function onAnyFormSubmit(e) {
  const sheetName = e && e.range && e.range.getSheet ? e.range.getSheet().getName() : '';
  if (!sheetName) return;

  if (sheetName === CONFIG.SHEETS.PASSWORD_RESPONSES) {
    handlePasswordFormSubmit_(e);
    return;
  }

  if (sheetName === CONFIG.SHEETS.COOL_RESPONSES) {
    handleCoolFormSubmit_(e);
    distributeByPreference();
    updateBCParticipants();
  }
}


/*************************************************
 *  パスワードフォーム処理
 *
 *  現在使用中: Google（MailApp）からメール送信
 *************************************************/
function handlePasswordFormSubmit_(e) {
  const named = getNamedValuesSafe_(e);
  const id = normalizeStudentId_(firstValue_(named[CONFIG.HEADERS.ID]));
  const name = String(firstValue_(named[CONFIG.HEADERS.NAME]) || '').trim();

  const now = new Date();
  const email = buildStudentMail_(id);

  const adminSS = SpreadsheetApp.openById(CONFIG.ADMIN_SPREADSHEET_ID);
  const masterSheet = getSheetByNameRequired_(adminSS, CONFIG.SHEETS.MASTER);
  const logSheet = getSheetByNameRequired_(adminSS, CONFIG.SHEETS.PASSWORD_LOG);

  if (!id) {
    appendRow_(logSheet, [now, '', name, '', '', 'フォーム再発行', '失敗', '学籍番号が空です']);
    return;
  }

  const newPassword = generatePassword_();
  upsertMasterPassword_(masterSheet, id, name, email, newPassword, now);

  const subject = `[${CONFIG.COURSE_NAME}] グループワーク申請用パスワードのお知らせ`;
  const body =
`${name || '学生'} さん

${CONFIG.COURSE_NAME}のグループワーク申請フォームで使用するパスワードを発行しました。

学籍番号：${id}
パスワード：${newPassword}

このパスワードは、グループワーク申請フォームへの回答時に使用します。
再発行された場合、以前のパスワードは無効になります。

パスワードは忘れないよう各自で控えておいてください。`;

  try {
    MailApp.sendEmail(email, subject, body, { htmlBody: buildEmailHtmlBody_(body) });
    appendRow_(logSheet, [now, "'" + id, name, email, "'" + newPassword, 'フォーム再発行', '成功', '']);
  } catch (err) {
    appendRow_(logSheet, [now, "'" + id, name, email, "'" + newPassword, 'フォーム再発行', '失敗', String(err)]);
  }
}


/*************************************************
 *  パスワードフォーム処理（切替用・現在は未使用）
 *
 *  API経由でメール送信する場合は、上の同名関数をコメントアウトし、
 *  下の handlePasswordFormSubmit_ のコメントアウトを解除する。
 *************************************************/
// function handlePasswordFormSubmit_(e) {
//   const named = getNamedValuesSafe_(e);
//   const id = normalizeStudentId_(firstValue_(named[CONFIG.HEADERS.ID]));
//   const name = String(firstValue_(named[CONFIG.HEADERS.NAME]) || '').trim();

//   const now = new Date();
//   const email = buildStudentMail_(id);

//   const adminSS = SpreadsheetApp.openById(CONFIG.ADMIN_SPREADSHEET_ID);
//   const masterSheet = getSheetByNameRequired_(adminSS, CONFIG.SHEETS.MASTER);
//   const logSheet = getSheetByNameRequired_(adminSS, CONFIG.SHEETS.PASSWORD_LOG);

//   if (!id) {
//     appendRow_(logSheet, [now, '', name, '', '', '発行/再発行', '失敗', '学籍番号が空です']);
//     return;
//   }

//   const newPassword = generatePassword_();
//   const rowInfo = findRowByValue_(masterSheet, 1, id);

//   if (rowInfo.row > 0) {
//     const old = masterSheet.getRange(rowInfo.row, 1, 1, MASTER_HEADERS.length).getValues()[0];
//     const currentCount = Number(old[4] || 0);
//     const firstIssuedAt = old[5] || now;

//     masterSheet.getRange(rowInfo.row, 1, 1, MASTER_HEADERS.length).setValues([[
//       "'" + id,
//       name || old[1],
//       email,
//       "'" + newPassword,
//       currentCount + 1,
//       firstIssuedAt,
//       now,
//       true
//     ]]);
//   } else {
//     appendRow_(masterSheet, [
//       "'" + id,
//       name,
//       email,
//       "'" + newPassword,
//       1,
//       now,
//       now,
//       true
//     ]);
//   }

//   const payload = {
//     studentId: id,
//     email: email,
//     password: newPassword,
//     courseName: CONFIG.COURSE_NAME,
//     issuedAt: now.toISOString()
//   };

//   try {
//     const result = sendPasswordToApi_(payload);

//     appendRow_(logSheet, [
//       now,
//       "'" + id,
//       name,
//       email,
//       "'" + newPassword,
//       '発行/再発行',
//       '成功',
//       `API送信成功 status=${result.statusCode}`
//     ]);

//   } catch (err) {
//     appendRow_(logSheet, [
//       now,
//       "'" + id,
//       name,
//       email,
//       "'" + newPassword,
//       '発行/再発行',
//       '失敗',
//       String(err)
//     ]);
//   }
// }


function sendPasswordToApi_(payload) {
  const token =
    PropertiesService.getScriptProperties().getProperty('PASSWORD_API_TOKEN') ||
    CONFIG.PASSWORD_API_TOKEN;

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + token
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(CONFIG.PASSWORD_API_URL, options);
  const statusCode = response.getResponseCode();
  const bodyText = response.getContentText();

  if (statusCode < 200 || statusCode >= 300) {
    throw new Error(`API送信失敗 status=${statusCode} body=${bodyText}`);
  }

  let json = {};
  try {
    json = JSON.parse(bodyText);
  } catch (e) {
    json = { raw: bodyText };
  }

  return {
    statusCode,
    body: json
  };
}


/*************************************************
 *  初回パスワード分割送信
 *
 *  授業開始前に「初回パスワード送信」シートの名簿へ初回パスワードを
 *  事前配布する。GAS のメール送信上限（一般アカウントで 100 通/日）に
 *  合わせ、CONFIG.INITIAL_PASSWORD_SETTINGS.SEND_SCHEDULE の日時で
 *  「次回分だけ」トリガーを 1 個ずつ予約しながら分割送信する。
 *
 *  処理の流れ:
 *  1. prepareInitialPasswordSheet     … 名簿シートを準備
 *  2. startInitialPasswordDistribution … 名簿を正規化し、最初の送信を予約
 *  3. sendInitialPasswordsScheduled    … トリガー本体（送信→次回分を予約）
 *  4. sendInitialPasswordsBatch_       … 実際の送信・状態更新（内部）
 *
 *  再発行は従来どおりパスワードフォーム（handlePasswordFormSubmit_）を使う。
 *************************************************/
function prepareInitialPasswordSheet() {
  const sh = getInitialPasswordSheet_(true);
  ensureInitialPasswordHeader_(sh);
  SpreadsheetApp.getUi().alert(
    `「${sh.getName()}」シートを準備しました。\n\n` +
    'A列（学籍番号）とB列（氏名）に対象者を貼り付けてから、\n' +
    '「分割送信を開始（次回分を予約）」を実行してください。'
  );
}

function startInitialPasswordDistribution() {
  const ui = SpreadsheetApp.getUi();
  const cfg = CONFIG.INITIAL_PASSWORD_SETTINGS;

  if (!cfg || !cfg.ENABLED) {
    ui.alert('CONFIG.INITIAL_PASSWORD_SETTINGS.ENABLED が false です。');
    return;
  }

  const sh = getInitialPasswordSheet_(false);
  if (!sh) {
    ui.alert(`「${cfg.SHEET_NAME}」シートがありません。\n先に「名簿シートを準備」を実行してください。`);
    return;
  }
  ensureInitialPasswordHeader_(sh);

  const counts = normalizeInitialPasswordRoster_(sh);
  if (counts.total === 0) {
    ui.alert('名簿に学籍番号がありません。A列に貼り付けてから再実行してください。');
    return;
  }
  if (counts.pending === 0 && counts.failed === 0) {
    ui.alert(`送信対象（未送信・送信失敗）がありません。\n\n${formatInitialPwCounts_(counts)}`);
    return;
  }

  const slot = findNextInitialPwSlot_(0);
  if (!slot) {
    ui.alert('SEND_SCHEDULE に未来の送信日時がありません。\nCONFIG.INITIAL_PASSWORD_SETTINGS.SEND_SCHEDULE を確認してください。');
    return;
  }

  cancelInitialPasswordTriggerOnly_();
  const trig = ScriptApp.newTrigger('sendInitialPasswordsScheduled').timeBased().at(slot.at).create();
  const prop = PropertiesService.getScriptProperties();
  prop.setProperty(PROP_KEYS.INITIAL_PW_TRIGGER_ID, trig.getUniqueId());
  prop.setProperty(PROP_KEYS.INITIAL_PW_SCHEDULE_INDEX, String(slot.index));
  prop.setProperty(PROP_KEYS.INITIAL_PW_STARTED_AT, new Date().toISOString());

  ui.alert(
    '初回パスワードの分割送信を開始しました。\n\n' +
    `${formatInitialPwCounts_(counts)}\n\n` +
    `次回送信：${formatJST_(slot.at)}\n` +
    `（SEND_SCHEDULE[${slot.index}] / 1回あたり上限 ${resolveInitialPwCount_(slot.index)} 件）\n` +
    '※実際の送信数はその時点の残りメール送信枠でさらに制限されます。'
  );
}

function sendInitialPasswordsNow() {
  const ui = SpreadsheetApp.getUi();
  const cfg = CONFIG.INITIAL_PASSWORD_SETTINGS;

  const sh = getInitialPasswordSheet_(false);
  if (!sh) {
    ui.alert(`「${cfg.SHEET_NAME}」シートがありません。`);
    return;
  }
  ensureInitialPasswordHeader_(sh);

  const def = cfg.BATCH_SIZE;
  const res = ui.prompt(
    '今すぐ1回分を送信',
    `送信する上限件数を入力してください（空欄なら ${def}）。\n` +
    '実際の送信数は残りのメール送信枠でさらに制限されます。\n' +
    '※この操作はスケジュール（次回予約）を進めません。',
    ui.ButtonSet.OK_CANCEL
  );
  if (res.getSelectedButton() !== ui.Button.OK) return;

  const txt = res.getResponseText().trim();
  const count = txt === '' ? def : Math.floor(Number(txt));
  if (isNaN(count) || count < 0) {
    ui.alert('0 以上の数値を入力してください。');
    return;
  }

  let stats;
  try {
    stats = sendInitialPasswordsBatch_(count);
  } catch (e) {
    ui.alert('送信に失敗しました\n' + e);
    return;
  }

  ui.alert(
    '送信が完了しました。\n\n' +
    `送信成功：${stats.sent}\n` +
    `送信失敗：${stats.failed}\n` +
    `送信上限（設定/枠）：${stats.limit}\n` +
    `残り未送信：${countInitialPwRemaining_()}`
  );
}

function showInitialPasswordStatus() {
  const ui = SpreadsheetApp.getUi();
  const cfg = CONFIG.INITIAL_PASSWORD_SETTINGS;

  const sh = getInitialPasswordSheet_(false);
  if (!sh) {
    ui.alert(`「${cfg.SHEET_NAME}」シートがありません。`);
    return;
  }

  const counts = tallyInitialPasswordStatus_(sh);
  const prop = PropertiesService.getScriptProperties();
  const idxStr = prop.getProperty(PROP_KEYS.INITIAL_PW_SCHEDULE_INDEX);

  let nextLine = '次回送信：未予約（「分割送信を開始」で予約されます）';
  if (idxStr !== null) {
    const at = resolveInitialPwScheduleAt_(Number(idxStr));
    nextLine = at
      ? `次回送信：${formatJST_(at)}（SEND_SCHEDULE[${idxStr}] / 上限 ${resolveInitialPwCount_(Number(idxStr))} 件）`
      : `次回送信：SEND_SCHEDULE[${idxStr}] の日時が不正です`;
  }

  let quota = '取得できませんでした';
  try {
    quota = String(MailApp.getRemainingDailyQuota());
  } catch (e) {}

  ui.alert(
    '【初回パスワード送信 状況】\n\n' +
    `対象合計：${counts.total}\n` +
    `　未送信　：${counts.pending}\n` +
    `　送信済み：${counts.sent}\n` +
    `　送信失敗：${counts.failed}\n` +
    `　対象外　：${counts.skipped}\n\n` +
    `${nextLine}\n` +
    `本日の残りメール送信可能数：${quota}`
  );
}

function cancelInitialPasswordDistribution() {
  cancelInitialPasswordTriggerOnly_();
  deleteProperty_(PROP_KEYS.INITIAL_PW_SCHEDULE_INDEX);
  deleteProperty_(PROP_KEYS.INITIAL_PW_STARTED_AT);
  SpreadsheetApp.getUi().alert(
    '初回パスワードの分割送信予約を解除しました。\n' +
    '（名簿シートの内容・送信状態は残しています）'
  );
}


/* ---- 初回パスワード送信：内部処理 ---- */

function getInitialPasswordSheet_(create) {
  const ss = SpreadsheetApp.openById(CONFIG.ADMIN_SPREADSHEET_ID);
  const name = CONFIG.INITIAL_PASSWORD_SETTINGS.SHEET_NAME;
  let sh = ss.getSheetByName(name);
  if (!sh && create) sh = ss.insertSheet(name);
  return sh || null;
}

// ensureSheetHeader_ は見出し不一致でシートを clear() するため使わない。
// 1 行目が空のときだけ見出しを書き、貼り付け済みデータは保持する。
function ensureInitialPasswordHeader_(sh) {
  const firstCell = String(sh.getRange(1, 1).getValue() || '').trim();
  if (firstCell === '') {
    sh.getRange(1, 1, 1, INITIAL_PASSWORD_HEADERS.length)
      .setValues([INITIAL_PASSWORD_HEADERS])
      .setFontWeight('bold');
    try { sh.setFrozenRows(1); } catch (e) {}
  }
}

// 名簿を整える:
//  - メールアドレス空欄を補完
//  - 状態が空の行を「未送信」に（SKIP_ALREADY_ISSUED なら発行済みは「対象外」）
//  - 名簿内で重複した学籍番号は「対象外」
// 既に「送信済み」「送信失敗」の行は変更しない。
function normalizeInitialPasswordRoster_(sh) {
  const counts = { total: 0, pending: 0, sent: 0, failed: 0, skipped: 0 };
  const lastRow = sh.getLastRow();
  if (lastRow <= 1) return counts;

  const width = INITIAL_PASSWORD_HEADERS.length;
  const range = sh.getRange(2, 1, lastRow - 1, width);
  const values = range.getValues();

  const cfg = CONFIG.INITIAL_PASSWORD_SETTINGS;
  let issuedIds = new Set();
  if (cfg.SKIP_ALREADY_ISSUED) {
    const masterSheet = getSheetByNameRequired_(
      SpreadsheetApp.openById(CONFIG.ADMIN_SPREADSHEET_ID), CONFIG.SHEETS.MASTER);
    issuedIds = getIssuedStudentIdSet_(masterSheet);
  }

  const seen = new Set();
  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    const id = normalizeStudentId_(row[INITIAL_PW_COLS.ID - 1]);
    if (!id) continue;
    counts.total++;

    if (String(row[INITIAL_PW_COLS.EMAIL - 1] || '').trim() === '') {
      row[INITIAL_PW_COLS.EMAIL - 1] = buildStudentMail_(id);
    }

    let status = String(row[INITIAL_PW_COLS.STATUS - 1] || '').trim();

    if (seen.has(id) && status !== INITIAL_PW_STATUS.SENT) {
      row[INITIAL_PW_COLS.STATUS - 1] = INITIAL_PW_STATUS.SKIPPED;
      row[INITIAL_PW_COLS.ERROR - 1] = '名簿内で学籍番号が重複しています';
      counts.skipped++;
      continue;
    }
    seen.add(id);

    if (status === '' || status === INITIAL_PW_STATUS.PENDING) {
      if (issuedIds.has(id)) {
        row[INITIAL_PW_COLS.STATUS - 1] = INITIAL_PW_STATUS.SKIPPED;
        row[INITIAL_PW_COLS.ERROR - 1] = 'すでにパスワード発行済みのため対象外';
        status = INITIAL_PW_STATUS.SKIPPED;
      } else {
        row[INITIAL_PW_COLS.STATUS - 1] = INITIAL_PW_STATUS.PENDING;
        status = INITIAL_PW_STATUS.PENDING;
      }
    }

    if (status === INITIAL_PW_STATUS.PENDING) counts.pending++;
    else if (status === INITIAL_PW_STATUS.SENT) counts.sent++;
    else if (status === INITIAL_PW_STATUS.FAILED) counts.failed++;
    else counts.skipped++;
  }

  reprefixInitialPwPasswordColumn_(values);
  range.setValues(values);
  return counts;
}

// bulk setValues で書き戻す際、パスワード列の先頭 "'"（文字列保持マーカー）を
// 付け直す。先頭 0 の欠落を防ぐため、コード全体で学籍番号・パスワードは
// "'" + 値 で保存する方針に合わせる。
function reprefixInitialPwPasswordColumn_(values) {
  for (const row of values) {
    const pw = String(row[INITIAL_PW_COLS.PASSWORD - 1] || '').replace(/^'/, '');
    row[INITIAL_PW_COLS.PASSWORD - 1] = pw ? "'" + pw : '';
  }
}

function getIssuedStudentIdSet_(masterSheet) {
  const set = new Set();
  const lastRow = masterSheet.getLastRow();
  if (lastRow <= 1) return set;

  const values = masterSheet.getRange(2, 1, lastRow - 1, MASTER_HEADERS.length).getValues();
  for (const row of values) {
    const id = normalizeStudentId_(String(row[0] || '').replace(/^'/, ''));
    if (!id) continue;
    if (Number(row[4] || 0) >= 1) set.add(id);
  }
  return set;
}

function tallyInitialPasswordStatus_(sh) {
  const counts = { total: 0, pending: 0, sent: 0, failed: 0, skipped: 0 };
  const lastRow = sh.getLastRow();
  if (lastRow <= 1) return counts;

  const values = sh.getRange(2, 1, lastRow - 1, INITIAL_PASSWORD_HEADERS.length).getValues();
  for (const row of values) {
    const id = normalizeStudentId_(row[INITIAL_PW_COLS.ID - 1]);
    if (!id) continue;
    counts.total++;
    const s = String(row[INITIAL_PW_COLS.STATUS - 1] || '').trim();
    if (s === INITIAL_PW_STATUS.SENT) counts.sent++;
    else if (s === INITIAL_PW_STATUS.FAILED) counts.failed++;
    else if (s === INITIAL_PW_STATUS.SKIPPED) counts.skipped++;
    else counts.pending++;
  }
  return counts;
}

function formatInitialPwCounts_(c) {
  return `対象合計 ${c.total}：未送信 ${c.pending} / 送信済み ${c.sent} / 送信失敗 ${c.failed} / 対象外 ${c.skipped}`;
}

function countInitialPwRemaining_() {
  const sh = getInitialPasswordSheet_(false);
  if (!sh) return 0;
  const lastRow = sh.getLastRow();
  if (lastRow <= 1) return 0;

  const values = sh.getRange(2, 1, lastRow - 1, INITIAL_PASSWORD_HEADERS.length).getValues();
  let n = 0;
  for (const row of values) {
    if (!normalizeStudentId_(row[INITIAL_PW_COLS.ID - 1])) continue;
    const s = String(row[INITIAL_PW_COLS.STATUS - 1] || '').trim();
    if (s === INITIAL_PW_STATUS.PENDING || s === INITIAL_PW_STATUS.FAILED || s === '') n++;
  }
  return n;
}

function resolveInitialPwCount_(index) {
  const cfg = CONFIG.INITIAL_PASSWORD_SETTINGS;
  const slot = (cfg.SEND_SCHEDULE || [])[index];
  const n = slot && Number(slot.count);
  return (n && n > 0) ? Math.floor(n) : cfg.BATCH_SIZE;
}

function resolveInitialPwScheduleAt_(index) {
  const slot = (CONFIG.INITIAL_PASSWORD_SETTINGS.SEND_SCHEDULE || [])[index];
  if (!slot || !slot.at) return null;
  try {
    return parseJST_YYYYMMDD_HHMM_(String(slot.at).trim());
  } catch (e) {
    Logger.log(`⚠️ SEND_SCHEDULE[${index}].at の形式が不正です（YYYY/MM/DD HH:mm）: ${slot.at}`);
    return null;
  }
}

function findNextInitialPwSlot_(fromIndex) {
  const schedule = CONFIG.INITIAL_PASSWORD_SETTINGS.SEND_SCHEDULE || [];
  for (let i = fromIndex; i < schedule.length; i++) {
    const at = resolveInitialPwScheduleAt_(i);
    if (at && at.getTime() > Date.now()) return { index: i, at };
  }
  return null;
}

function cancelInitialPasswordTriggerOnly_() {
  deleteTriggerByStoredId_(PROP_KEYS.INITIAL_PW_TRIGGER_ID);
}

// 時間ベーストリガー本体。今回分を送信し、未送信が残っていれば
// 次のスケジュールスロットへトリガーを 1 個だけ張り替える。
function sendInitialPasswordsScheduled() {
  const prop = PropertiesService.getScriptProperties();
  const idxStr = prop.getProperty(PROP_KEYS.INITIAL_PW_SCHEDULE_INDEX);
  const index = (idxStr === null) ? 0 : Number(idxStr);

  let stats = null;
  try {
    stats = sendInitialPasswordsBatch_(resolveInitialPwCount_(index));
  } catch (e) {
    Logger.log('⚠️ 初回パスワード送信でエラー: ' + e);
  }

  const remaining = countInitialPwRemaining_();
  const nextSlot = findNextInitialPwSlot_(index + 1);

  cancelInitialPasswordTriggerOnly_();

  if (remaining > 0 && nextSlot) {
    const trig = ScriptApp.newTrigger('sendInitialPasswordsScheduled').timeBased().at(nextSlot.at).create();
    prop.setProperty(PROP_KEYS.INITIAL_PW_TRIGGER_ID, trig.getUniqueId());
    prop.setProperty(PROP_KEYS.INITIAL_PW_SCHEDULE_INDEX, String(nextSlot.index));
    Logger.log(
      `✅ 初回パスワード: 今回 ${stats ? stats.sent : '?'} 件送信。` +
      `次回 ${formatJST_(nextSlot.at)}（残り未送信 ${remaining} 名）`
    );
  } else {
    prop.deleteProperty(PROP_KEYS.INITIAL_PW_SCHEDULE_INDEX);
    if (remaining > 0) {
      Logger.log(`⚠️ 初回パスワード: SEND_SCHEDULE を使い切りましたが未送信が ${remaining} 名残っています。日程を追加して「分割送信を開始」を再実行してください。`);
    } else {
      Logger.log('✅ 初回パスワードの分割送信がすべて完了しました。');
    }
  }
}

// 実際の送信本体。残りメール送信枠と設定件数の小さい方だけ送る。
function sendInitialPasswordsBatch_(requestedCount) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    throw new Error('別の処理が実行中のため送信をスキップしました。');
  }

  try {
    const cfg = CONFIG.INITIAL_PASSWORD_SETTINGS;
    const sh = getInitialPasswordSheet_(false);
    if (!sh) throw new Error(`「${cfg.SHEET_NAME}」シートがありません。`);

    // 開始後に追加された行のメール補完・重複/発行済み判定もここで揃える。
    ensureInitialPasswordHeader_(sh);
    normalizeInitialPasswordRoster_(sh);

    const stats = { requested: requestedCount, limit: 0, sent: 0, failed: 0, targets: 0 };
    const lastRow = sh.getLastRow();
    if (lastRow <= 1) return stats;

    const width = INITIAL_PASSWORD_HEADERS.length;
    const values = sh.getRange(2, 1, lastRow - 1, width).getValues();

    const remainingQuota = MailApp.getRemainingDailyQuota();
    const allowedByQuota = Math.max(0, remainingQuota - cfg.KEEP_QUOTA);
    const limit = Math.max(0, Math.min(requestedCount, allowedByQuota));
    stats.limit = limit;
    if (limit === 0) {
      Logger.log(`⚠️ 初回パスワード: 送信可能件数が 0（残クォータ ${remainingQuota} / 予備 ${cfg.KEEP_QUOTA}）。`);
      return stats;
    }

    const order = buildInitialPasswordTargetOrder_(values, cfg.RETRY_FAILED_FIRST);
    stats.targets = order.length;

    const adminSS = SpreadsheetApp.openById(CONFIG.ADMIN_SPREADSHEET_ID);
    const masterSheet = getSheetByNameRequired_(adminSS, CONFIG.SHEETS.MASTER);
    const logSheet = getSheetByNameRequired_(adminSS, CONFIG.SHEETS.PASSWORD_LOG);

    for (const i of order) {
      if (stats.sent >= limit) break;

      const row = values[i];
      const id = normalizeStudentId_(row[INITIAL_PW_COLS.ID - 1]);
      if (!id) continue;

      const name = String(row[INITIAL_PW_COLS.NAME - 1] || '').trim();
      row[INITIAL_PW_COLS.ATTEMPTS - 1] = Number(row[INITIAL_PW_COLS.ATTEMPTS - 1] || 0) + 1;

      if (!name && !cfg.ALLOW_NO_NAME) {
        row[INITIAL_PW_COLS.STATUS - 1] = INITIAL_PW_STATUS.FAILED;
        row[INITIAL_PW_COLS.ERROR - 1] = '氏名が未入力です（ALLOW_NO_NAME=false）';
        stats.failed++;
        continue;
      }

      const email = String(row[INITIAL_PW_COLS.EMAIL - 1] || '').trim() || buildStudentMail_(id);
      const existingPw = String(row[INITIAL_PW_COLS.PASSWORD - 1] || '').replace(/^'/, '').trim();
      const password = existingPw || generatePassword_();
      const now = new Date();

      upsertMasterPassword_(masterSheet, id, name, email, password, now);

      row[INITIAL_PW_COLS.EMAIL - 1] = email;
      row[INITIAL_PW_COLS.PASSWORD - 1] = "'" + password;

      try {
        const pwBody = buildInitialPasswordBody_(name, id, password);
        MailApp.sendEmail(email, buildInitialPasswordSubject_(), pwBody, { htmlBody: buildEmailHtmlBody_(pwBody) });
        row[INITIAL_PW_COLS.STATUS - 1] = INITIAL_PW_STATUS.SENT;
        row[INITIAL_PW_COLS.SENT_AT - 1] = now;
        row[INITIAL_PW_COLS.ERROR - 1] = '';
        appendRow_(logSheet, [now, "'" + id, name, email, "'" + password, '初回一括発行', '成功', '']);
        stats.sent++;
      } catch (err) {
        row[INITIAL_PW_COLS.STATUS - 1] = INITIAL_PW_STATUS.FAILED;
        row[INITIAL_PW_COLS.ERROR - 1] = String(err);
        appendRow_(logSheet, [now, "'" + id, name, email, "'" + password, '初回一括発行', '失敗', String(err)]);
        stats.failed++;
      }
    }

    reprefixInitialPwPasswordColumn_(values);
    sh.getRange(2, 1, values.length, width).setValues(values);
    sh.getRange(2, INITIAL_PW_COLS.SENT_AT, values.length, 1).setNumberFormat('yyyy/MM/dd HH:mm:ss');
    SpreadsheetApp.flush();

    Logger.log(`初回パスワード送信: 送信 ${stats.sent} / 失敗 ${stats.failed}（上限 ${limit} / 残クォータ ${remainingQuota}）`);
    return stats;
  } finally {
    lock.releaseLock();
  }
}

function buildInitialPasswordTargetOrder_(values, retryFailedFirst) {
  const failed = [];
  const pending = [];
  for (let i = 0; i < values.length; i++) {
    if (!normalizeStudentId_(values[i][INITIAL_PW_COLS.ID - 1])) continue;
    const s = String(values[i][INITIAL_PW_COLS.STATUS - 1] || '').trim();
    if (s === INITIAL_PW_STATUS.FAILED) failed.push(i);
    else if (s === INITIAL_PW_STATUS.PENDING || s === '') pending.push(i);
  }
  return retryFailedFirst ? failed.concat(pending) : pending.concat(failed);
}

function upsertMasterPassword_(masterSheet, id, name, email, password, now) {
  const rowInfo = findRowByValue_(masterSheet, 1, id);
  if (rowInfo.row > 0) {
    const old = masterSheet.getRange(rowInfo.row, 1, 1, MASTER_HEADERS.length).getValues()[0];
    const currentCount = Number(old[4] || 0);
    const firstIssuedAt = old[5] || now;
    masterSheet.getRange(rowInfo.row, 1, 1, MASTER_HEADERS.length).setValues([[
      "'" + id,
      name || old[1],
      email,
      "'" + password,
      currentCount + 1,
      firstIssuedAt,
      now,
      true
    ]]);
  } else {
    appendRow_(masterSheet, ["'" + id, name, email, "'" + password, 1, now, now, true]);
  }
}

function buildInitialPasswordSubject_() {
  return `[${CONFIG.COURSE_NAME}] グループワーク申請用パスワードのお知らせ`;
}

function buildInitialPasswordBody_(name, id, password) {
  return `${name || '学生'} さん

${CONFIG.COURSE_NAME}のグループワーク申請フォームで使用するパスワードを発行しました。

学籍番号：${id}
パスワード：${password}

このパスワードは、グループワーク申請フォームへの回答時に使用します。
パスワードを忘れた場合は、パスワード（再発行）フォームから再発行してください。
再発行された場合、以前のパスワードは無効になります。

パスワードは忘れないよう各自で控えておいてください。`;
}

// プレーンテキスト本文をHTMLメール用に変換する。
// Outlook（Wordエンジン）は white-space:pre-wrap 等のCSSでの改行保持を解釈しないため、
// 改行は <br> に変換して明示的に反映する。氏名など利用者入力を含むためHTMLエスケープも行う。
function buildEmailHtmlBody_(plainText) {
  const html = escapeHtml_(plainText).replace(/\n/g, '<br>');
  return `<div style="font-family: sans-serif; font-size: 14px; line-height: 1.6;">${html}</div>`;
}

function escapeHtml_(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}


/*************************************************
 *  クール申請フォーム処理
 *************************************************/
function handleCoolFormSubmit_(e) {
  const adminSS = SpreadsheetApp.openById(CONFIG.ADMIN_SPREADSHEET_ID);
  const validSheet = getSheetByNameRequired_(adminSS, CONFIG.SHEETS.VALID);
  const invalidSheet = getSheetByNameRequired_(adminSS, CONFIG.SHEETS.INVALID);
  const masterSheet = getSheetByNameRequired_(adminSS, CONFIG.SHEETS.MASTER);

  const named = getNamedValuesSafe_(e);

  const ts = new Date();
  const id = normalizeStudentId_(firstValue_(named[CONFIG.HEADERS.ID]));
  const password = String(firstValue_(named[CONFIG.HEADERS.PASSWORD]) || '').trim();
  const pref = String(firstValue_(named[CONFIG.HEADERS.PREF]) || '').trim();
  const name = String(firstValue_(named[CONFIG.HEADERS.NAME]) || '').trim();
  const reason = String(firstValue_(named[CONFIG.HEADERS.REASON]) || '').trim();
  const free = String(firstValue_(named[CONFIG.HEADERS.FREE]) || '').trim();

  if (!id || !password || !pref) {
    appendRow_(invalidSheet, [ts, "'" + id, "'" + password, pref, name, reason, free, '必須項目不足', '']);
    return;
  }

  const auth = validatePassword_(masterSheet, id, password);
  if (!auth.ok) {
    appendRow_(invalidSheet, [ts, "'" + id, "'" + password, pref, name, reason, free, auth.reason, '']);
    return;
  }

  const apply = canApplyNow_(validSheet, id, pref);
  if (!apply.ok) {
    appendRow_(invalidSheet, [ts, "'" + id, "'" + password, pref, name, reason, free, apply.reason, '']);
    return;
  }

  appendRow_(validSheet, [ts, "'" + id, "'" + password, pref, name, reason, free, apply.type, apply.note || '', '未処理']);
}

function validatePassword_(masterSheet, id, password) {
  const rowInfo = findRowByValue_(masterSheet, 1, id);
  if (rowInfo.row <= 0) {
    return { ok: false, reason: '未発行の学籍番号です' };
  }

  const row = masterSheet.getRange(rowInfo.row, 1, 1, MASTER_HEADERS.length).getValues()[0];
  let savedPassword = String(row[3] || '').trim();
  const enabled = row[7] === true || String(row[7]).toLowerCase() === 'true';

  // 数値として保存されて先頭の0が消えている場合に備えてパディングして比較
  if (savedPassword && !isNaN(savedPassword)) {
    savedPassword = savedPassword.padStart(CONFIG.PASSWORD_LENGTH, '0');
  }

  if (!enabled) return { ok: false, reason: 'パスワードが無効です' };
  if (savedPassword !== password) return { ok: false, reason: 'パスワード不一致' };

  return { ok: true };
}

function canApplyNow_(validSheet, id, newPref) {
  const values = validSheet.getDataRange().getValues();
  if (values.length <= 1) {
    return { ok: true, type: '初回申請', note: '' };
  }

  const header = values[0].map(String);
  const cId = header.indexOf(CONFIG.HEADERS.ID);
  const cPref = header.indexOf(CONFIG.HEADERS.PREF);
  const cTs = header.indexOf(CONFIG.HEADERS.TS);

  if (cId < 0 || cPref < 0 || cTs < 0) {
    return { ok: false, reason: '有効申請シートの見出し不整合' };
  }

  let latest = null;
  for (let r = 1; r < values.length; r++) {
    const rowId = normalizeStudentId_(values[r][cId]);
    if (rowId !== id) continue;

    const ts = toTime_(values[r][cTs]);
    if (!latest || ts > latest.ts) {
      latest = {
        ts,
        pref: String(values[r][cPref] || '').trim()
      };
    }
  }

  if (!latest) {
    return { ok: true, type: '初回申請', note: '' };
  }

  const current = buildCurrentBuckets_();
  const isCurrentlyReapply = current.reapply.includes(id);
  const newNorm = normalizePref_(newPref);
  const oldNorm = normalizePref_(latest.pref);

  if (isCurrentlyReapply) {
    return { ok: true, type: '再申請', note: '再度申請欄からの再申請' };
  }

  if (newNorm === normalizePref_(CONFIG.PREF_VALUE.BC) &&
      oldNorm !== normalizePref_(CONFIG.PREF_VALUE.BC)) {
    return { ok: true, type: 'BC移動', note: '通常クールからBCへ移動' };
  }

  return { ok: false, reason: '既に有効申請済みです' };
}


/*************************************************
 *  クール分け
 *************************************************/
function updateRostersNow() {
  distributeByPreference();
  updateBCParticipants();
  SpreadsheetApp.getUi().alert('クール分けとBC参加者名簿を更新しました。');
}

function distributeByPreference() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    Logger.log('ロックの取得に失敗しました。');
    return;
  }

  try {
    const adminSS = SpreadsheetApp.openById(CONFIG.ADMIN_SPREADSHEET_ID);
    const validSheet = getSheetByNameRequired_(adminSS, CONFIG.SHEETS.VALID);
    const invalidSheet = getSheetByNameRequired_(adminSS, CONFIG.SHEETS.INVALID);

    const rosterSheet = getStudentRosterSheet_();

    const validValues = validSheet.getDataRange().getValues();
    const invalidValues = invalidSheet.getDataRange().getValues();

    if (validValues.length <= 1 && invalidValues.length <= 1) {
      writeRoster_(rosterSheet, ...emptyBuckets_());
      return;
    }

    const validHeader = validValues[0].map(String);
    const cTs = validHeader.indexOf(CONFIG.HEADERS.TS);
    const cId = validHeader.indexOf(CONFIG.HEADERS.ID);
    const cPref = validHeader.indexOf(CONFIG.HEADERS.PREF);

    if (validValues.length > 1 && (cTs < 0 || cId < 0 || cPref < 0)) {
      throw new Error('有効申請シートの見出しが不足しています。');
    }

    const latestValid = new Map();
    for (let r = 1; r < validValues.length; r++) {
      const row = validValues[r];
      const id = normalizeStudentId_(row[cId]);
      if (!id) continue;

      const ts = toTime_(row[cTs]);
      const pref = String(row[cPref] || '').trim();
      // 10列目はステータス（Index 9）
      const status = String(row[9] || '').trim();

      const prev = latestValid.get(id);
      if (!prev || ts > prev.ts) {
        latestValid.set(id, { ts, id, pref, status });
      }
    }

    const coolBuckets = Array.from({ length: CONFIG.TOTAL_COOLS }, () => []);
    const bc = [];
    const reapplySet = new Set();

    const currentRoster = buildCurrentBuckets_();
    const alreadyReapply = new Set(currentRoster.reapply);

    for (const { id, pref, status } of latestValid.values()) {
      const s = normalizePref_(pref);

      // すでに再度申請に入っており、かつ「出し直し（未処理）」ていない場合は、再度申請を維持（繰り上がり防止）
      const isNew = (status === '未処理');
      if (!isNew && alreadyReapply.has(id)) {
        if (s === normalizePref_(CONFIG.PREF_VALUE.BC)) {
          bc.push(id);
        } else {
          reapplySet.add(id);
        }
        continue;
      }

      if (s === normalizePref_(CONFIG.PREF_VALUE.COOL1)) coolBuckets[0].push(id);
      else if (s === normalizePref_(CONFIG.PREF_VALUE.COOL2)) coolBuckets[1].push(id);
      else if (s === normalizePref_(CONFIG.PREF_VALUE.COOL3)) coolBuckets[2].push(id);
      else if (CONFIG.TOTAL_COOLS >= 4 && s === normalizePref_(CONFIG.PREF_VALUE.COOL4)) coolBuckets[3].push(id);
      else if (s === normalizePref_(CONFIG.PREF_VALUE.BC)) bc.push(id);
      else reapplySet.add(id);
    }

    const capacityPerCool = CONFIG.TEAMS_PER_COHORT * CONFIG.MEMBERS_PER_TEAM;

    const take = (arr) => {
      const main = arr.slice(0, capacityPerCool);
      const extra = arr.slice(capacityPerCool);
      for (const id of extra) reapplySet.add(id);
      return main;
    };

    for (let i = 0; i < coolBuckets.length; i++) {
      coolBuckets[i] = take(coolBuckets[i]);
    }

    if (invalidValues.length > 1) {
      const invalidHeader = invalidValues[0].map(String);
      const icId = invalidHeader.indexOf(CONFIG.HEADERS.ID);
      if (icId >= 0) {
        for (let r = 1; r < invalidValues.length; r++) {
          const id = normalizeStudentId_(invalidValues[r][icId]);
          if (!id) continue;

          // すでに有効申請がある学生は動かさない
          if (latestValid.has(id)) continue;

          reapplySet.add(id);
        }
      }
    }

    const reapply = Array.from(reapplySet);
    const reapplyLookup = new Set(reapply);

    for (let i = 0; i < coolBuckets.length; i++) {
      coolBuckets[i] = coolBuckets[i].filter(id => !reapplyLookup.has(id));
    }
    const filteredBC = bc.filter(id => !reapplyLookup.has(id));

    writeRoster_(rosterSheet, ...coolBuckets, filteredBC, reapply);
    SpreadsheetApp.flush(); // 名簿の更新を確実に反映させる

    // ステータスを「処理済み」に更新
    if (validValues.length > 1) {
      validSheet.getRange(2, 10, validValues.length - 1, 1).setValue('処理済み');
    }
    SpreadsheetApp.flush(); // ステータスの更新を確実に反映させる
  } finally {
    lock.releaseLock();
  }
}

function buildCurrentBuckets_() {
  const sheet = getStudentRosterSheet_();
  const values = sheet.getDataRange().getValues();

  const result = {
    cools: Array.from({ length: CONFIG.TOTAL_COOLS }, () => []),
    bc: [],
    reapply: []
  };

  if (values.length <= 1) return result;

  const header = values[0].map(String);
  const data = values.slice(1);

  const reapplyIndex = header.indexOf(CONFIG.LABELS.REAPPLY);
  const bcIndex = header.indexOf(CONFIG.LABELS.BC);

  for (let i = 0; i < CONFIG.TOTAL_COOLS; i++) {
    const idx = header.indexOf(coolLabel_(i + 1));
    if (idx >= 0) {
      result.cools[i] = data.map(r => normalizeStudentId_(r[idx])).filter(Boolean);
    }
  }

  if (bcIndex >= 0) result.bc = data.map(r => normalizeStudentId_(r[bcIndex])).filter(Boolean);
  if (reapplyIndex >= 0) result.reapply = data.map(r => normalizeStudentId_(r[reapplyIndex])).filter(Boolean);

  return result;
}


/*************************************************
 *  BC参加者
 *************************************************/
function updateBCParticipants() {
  const adminSS = SpreadsheetApp.openById(CONFIG.ADMIN_SPREADSHEET_ID);
  const validSheet = getSheetByNameRequired_(adminSS, CONFIG.SHEETS.VALID);
  const bcSheet = getSheetByNameRequired_(adminSS, CONFIG.SHEETS.BC);

  clearKeepHeader_(bcSheet);

  const values = validSheet.getDataRange().getValues();
  const header = values[0].map(String);
  const cTs = header.indexOf(CONFIG.HEADERS.TS);
  const cId = header.indexOf(CONFIG.HEADERS.ID);
  const cPref = header.indexOf(CONFIG.HEADERS.PREF);
  const cName = header.indexOf(CONFIG.HEADERS.NAME);
  const cReason = header.indexOf(CONFIG.HEADERS.REASON);
  const cFree = header.indexOf(CONFIG.HEADERS.FREE);

  if ([cTs, cId, cPref, cName, cReason, cFree].some(i => i < 0)) {
    throw new Error('有効申請シートの見出しが不足しています。');
  }

  const latest = new Map();
  for (let r = 1; r < values.length; r++) {
    const row = values[r];
    const id = normalizeStudentId_(row[cId]);
    if (!id) continue;

    const ts = toTime_(row[cTs]);
    const pref = String(row[cPref] || '').trim();
    const name = String(row[cName] || '').trim();
    const reason = String(row[cReason] || '').trim();
    const free = String(row[cFree] || '').trim();

    const prev = latest.get(id);
    if (!prev || ts > prev.ts) {
      latest.set(id, { ts, id, pref, name, reason, free });
    }
  }

  const rows = [];
  const includedIds = new Set();
  for (const v of latest.values()) {
    if (normalizePref_(v.pref) === normalizePref_(CONFIG.PREF_VALUE.BC)) {
      rows.push(["'" + v.id, v.name, v.reason, v.free]);
      includedIds.add(v.id);
    }
  }

  const sameDaySheet = adminSS.getSheetByName(CONFIG.SHEETS.SAME_DAY);
  for (const row of getProcessedSameDayBcParticipantRows_(sameDaySheet)) {
    const id = normalizeBcParticipantId_(row[0]);
    if (!id || includedIds.has(id)) continue;
    rows.push(row);
    includedIds.add(id);
  }

  if (rows.length > 0) {
    bcSheet.getRange(2, 1, rows.length, BC_HEADERS.length).setValues(rows);
  }
}


/*************************************************
 *  グループ分け（確認修正用）
 *************************************************/
// 週次トリガー専用。手動実行は makeRandomGroups（予約を変更しない）を使うこと。
// ⚠️ バグ修正：以前はこの翌週予約呼び出しが makeRandomGroups() 本体にあり、
// メニューから手動実行するたびに「次回のグループ分け予定」が1週間後ろへずれていた
// （resetAllData で見つかったのと同じ原因）。トリガー専用関数に分離して回避する。
function makeRandomGroupsTriggerSafe() {
  try {
    autoScheduleNextWeek_(PROP_KEYS.MAKE_RANDOM_GROUPS_AT, scheduleMakeRandomGroupsAt, 'makeRandomGroups');
  } catch (e) {
    Logger.log('⚠️ makeRandomGroups 翌週トリガーの自動予約に失敗: ' + e);
  }
  makeRandomGroups();
}

function makeRandomGroups() {
  // 旧版のフォーム締切後トリガーが残っている場合だけ掃除する（互換用）
  try {
    deleteTriggerByStoredId_(PROP_KEYS.AUTO_GROUP_TRIGGER_ID);
  } catch (e) {}

  try {
    runMakeRandomGroupsCore_();
    Logger.log('✅ グループ分けが完了しました。');
    // UIコンテキスト（手動実行）の場合のみアラートを表示
    try {
      SpreadsheetApp.getUi().alert('グループ案を「グループ分け確認修正用」に出力しました。内容を確認・修正してください。');
    } catch (_) {
      // トリガー実行時は getUi() が使えないため、ログのみ
    }
  } catch (e) {
    Logger.log('⚠️ グループ分けでエラーが発生しました: ' + e);
    // UIコンテキスト（手動実行）の場合のみアラートを表示
    try {
      SpreadsheetApp.getUi().alert('グループ分けでエラーが発生しました\n' + e);
    } catch (_) {
      // トリガー実行時は getUi() が使えないため、ログのみ
    }
  }
}

function runMakeRandomGroupsCore_() {
  const rosterSheet = getStudentRosterSheet_();

  const lastRow = rosterSheet.getLastRow();
  if (lastRow <= 1) {
    throw new Error('名簿シートにデータがありません。');
  }

  const lastCol = rosterSheet.getLastColumn();
  const header = rosterSheet.getRange(1, 1, 1, lastCol).getValues()[0].map(String);
  const idx = {
    c1: header.indexOf(coolLabel_(1)),
    c2: header.indexOf(coolLabel_(2)),
    c3: header.indexOf(coolLabel_(3)),
    c4: header.indexOf(coolLabel_(4)),
    bc: header.indexOf(CONFIG.LABELS.BC),
    reapply: header.indexOf(CONFIG.LABELS.REAPPLY)
  };

  const data = rosterSheet.getRange(2, 1, lastRow - 1, lastCol).getValues();

  const colToList = (colIdx) => (colIdx >= 0)
    ? data.map(r => normalizeStudentId_(r[colIdx])).filter(Boolean)
    : [];

  const list1 = colToList(idx.c1);
  const list2 = colToList(idx.c2);
  const list3 = colToList(idx.c3);
  const list4 = colToList(idx.c4);
  const listBC = colToList(idx.bc);
  const listReapply = colToList(idx.reapply);

  const allLists = [list1, list2, list3, list4];
  const activeLists = allLists.slice(0, CONFIG.TOTAL_COOLS);

  const Ts = activeLists.map((list, i) => {
    return isSameDayTargetCool_(i + 1)
      ? chooseTeamsCountWithSameDayReserve_(list.length, CONFIG.TEAMS_PER_COHORT)
      : chooseTeamsCount_(list.length, CONFIG.TEAMS_PER_COHORT);
  });
  const probs = [];

  for (let i = 0; i < activeLists.length; i++) {
    if (activeLists[i].length && Ts[i] === 0) {
      probs.push(`${coolLabel_(i + 1)}: ${activeLists[i].length} 名 → 3/4人のみで編成不可`);
    }
  }
  if (probs.length) throw new Error(probs.join(' | '));

  const gs = activeLists.map((list, i) => {
    const groups = splitTeams34Strict_(shuffleCopy_(list), Ts[i], coolLabel_(i + 1));
    // 常に最大チーム数（CONFIG.TEAMS_PER_COHORT）まで空のグループを追加して枠を確保
    for (let gNo = groups.length + 1; gNo <= CONFIG.TEAMS_PER_COHORT; gNo++) {
      groups.push({ no: gNo, members: [] });
    }
    return groups;
  });

  const W = CONFIG.TEAMS_PER_COHORT;
  const pairsAll = gs.map((g, i) => flattenPairs_(g, i * W));

  const adminSS = SpreadsheetApp.openById(CONFIG.ADMIN_SPREADSHEET_ID);
  let out = adminSS.getSheetByName(CONFIG.SHEETS.GROUP_CHECK);
  if (!out) out = adminSS.insertSheet(CONFIG.SHEETS.GROUP_CHECK);
  out.clear();

  const blocks = [];
  for (let i = 0; i < activeLists.length; i++) {
    blocks.push({
      title: `【${coolLabel_(i + 1)}】`,
      head: ['グループ番号', '学籍番号', ''],
      rows: pairsToRows_(pairsAll[i]),
      widths: [100, 100, 40]
    });
  }
  blocks.push({ title: `【${CONFIG.LABELS.BC}】`, head: ['学籍番号', ''], rows: listToRows_(listBC), widths: [100, 40] });
  blocks.push({ title: `【${CONFIG.LABELS.REAPPLY}】`, head: ['学籍番号', ''], rows: listToRows_(listReapply), widths: [100, 40] });
  blocks.push({ title: `【${CONFIG.LABELS.MANUAL}】`, head: ['学籍番号', ''], rows: [], widths: [100, 40] });

  writeBlockLayout_(out, blocks);
}


/*************************************************
 *  グループ公開（確認修正用 → 学生共有用）
 *************************************************/
function publishGroupsNow() {
  const adminSS = SpreadsheetApp.openById(CONFIG.ADMIN_SPREADSHEET_ID);
  const src = getSheetByNameRequired_(adminSS, CONFIG.SHEETS.GROUP_CHECK);

  const studentSS = SpreadsheetApp.openById(CONFIG.STUDENT_SPREADSHEET_ID);
  let dest = studentSS.getSheetByName(CONFIG.STUDENT_SHEETS.GROUPS);
  if (!dest) dest = studentSS.insertSheet(CONFIG.STUDENT_SHEETS.GROUPS);

  dest.clear();

  const range = src.getDataRange();
  if (range.getNumRows() > 0 && range.getNumColumns() > 0) {
    const values = range.getValues();
    const destRange = dest.getRange(1, 1, values.length, values[0].length);
    destRange.setValues(values);

    // 書式コピー
    copyRangeStylesAcrossSpreadsheets_(range, destRange);
  }

  const maxRows = Math.max(src.getLastRow(), 1);
  const maxCols = Math.max(src.getLastColumn(), 1);

  for (let c = 1; c <= maxCols; c++) {
    dest.setColumnWidth(c, src.getColumnWidth(c));
  }

  SpreadsheetApp.getUi().alert('グループ分けを学生共有用シートに公開しました。');
}

function publishGroupsNowTriggerSafe() {
  try {
    publishGroupsNowCore_();
    // 翌週分を自動予約
    autoScheduleNextWeek_(PROP_KEYS.GROUP_PUBLISH_AT, scheduleGroupPublishAt);
    Logger.log('✅ グループ分けを公開し、翌週分を予約しました。');
  } catch (e) {
    Logger.log('⚠️ グループ公開に失敗: ' + e);
  }
}

function publishGroupsNowCore_() {
  const adminSS = SpreadsheetApp.openById(CONFIG.ADMIN_SPREADSHEET_ID);
  const src = getSheetByNameRequired_(adminSS, CONFIG.SHEETS.GROUP_CHECK);

  const studentSS = SpreadsheetApp.openById(CONFIG.STUDENT_SPREADSHEET_ID);
  let dest = studentSS.getSheetByName(CONFIG.STUDENT_SHEETS.GROUPS);
  if (!dest) dest = studentSS.insertSheet(CONFIG.STUDENT_SHEETS.GROUPS);

  dest.clear();

  const range = src.getDataRange();
  if (range.getNumRows() > 0 && range.getNumColumns() > 0) {
    const values = range.getValues();
    const destRange = dest.getRange(1, 1, values.length, values[0].length);
    destRange.setValues(values);

    // 書式コピー
    copyRangeStylesAcrossSpreadsheets_(range, destRange);
  }

  const maxRows = Math.max(src.getLastRow(), 1);
  const maxCols = Math.max(src.getLastColumn(), 1);

  for (let c = 1; c <= maxCols; c++) {
    dest.setColumnWidth(c, src.getColumnWidth(c));
  }
}

function scheduleGroupPublishAt(publishAt) {
  validateFutureDate_(publishAt, '公開時刻');
  cancelGroupPublishSchedule();

  const trig = ScriptApp.newTrigger('publishGroupsNowTriggerSafe').timeBased().at(publishAt).create();
  const prop = PropertiesService.getScriptProperties();
  prop.setProperty(PROP_KEYS.GROUP_PUBLISH_TRIGGER_ID, trig.getUniqueId());
  prop.setProperty(PROP_KEYS.GROUP_PUBLISH_AT, publishAt.toISOString());
}

function cancelGroupPublishSchedule() {
  deleteTriggerByStoredId_(PROP_KEYS.GROUP_PUBLISH_TRIGGER_ID);
  deleteProperty_(PROP_KEYS.GROUP_PUBLISH_AT);
}

function showGroupPublishSchedule() {
  const iso = PropertiesService.getScriptProperties().getProperty(PROP_KEYS.GROUP_PUBLISH_AT);
  const msg = iso
    ? `公開予約日時：${formatJST_(new Date(iso))}`
    : 'グループ分けの公開予約は設定されていません。';
  SpreadsheetApp.getUi().alert(msg);
}

function scheduleGroupPublishFromConfig() {
  const cfg = CONFIG.WEEKLY_SCHEDULE.groupPublish;
  if (!cfg) return;

  try {
    const at = getNextWeekdayTimeJST_(cfg.day, cfg.hour, cfg.minute);
    scheduleGroupPublishAt(at);
    SpreadsheetApp.getUi().alert(`公開予約を設定しました。\n公開日時：${formatJST_(at)}`);
  } catch (e) {
    SpreadsheetApp.getUi().alert('公開予約に失敗しました\n' + e);
  }
}


/*************************************************
 *  当日申請（グループ分け後の追加・BC移動）
 *
 *  処理順:
 *  1. 既存所属・重複・BC希望を判定
 *  2. 既存の2〜3人チームの空きへ配置
 *  3. 空グループがある場合、当日申請者3人で新チームを作成
 *  4. 配置できない学生を手動割り当てへ移動
 *************************************************/
function prepareSameDayApplicationsSheet() {
  const sheet = ensureSameDayApplicationSheet_();
  SpreadsheetApp.getUi().alert(
    `「${sheet.getName()}」シートを準備しました。\n` +
    '当日申請者を貼り付けてから「当日申請を空き枠へ反映」を実行してください。'
  );
}

function applySameDayApplicationsNow() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    SpreadsheetApp.getUi().alert('別の処理が実行中です。少し待ってから再実行してください。');
    return;
  }

  try {
    const adminSS = SpreadsheetApp.openById(CONFIG.ADMIN_SPREADSHEET_ID);
    const sameDaySheet = ensureSameDayApplicationSheet_();
    const groupSheet = getSheetByNameRequired_(adminSS, CONFIG.SHEETS.GROUP_CHECK);
    const bcSheet = getSheetByNameRequired_(adminSS, CONFIG.SHEETS.BC);

    const lastRow = sameDaySheet.getLastRow();
    if (lastRow <= 1) {
      SpreadsheetApp.getUi().alert(`「${CONFIG.SHEETS.SAME_DAY}」に処理対象の行がありません。`);
      return;
    }

    const cols = getSameDayColumnIndexes_(sameDaySheet);
    if (cols.id < 1 || cols.pref < 1) {
      throw new Error(`「${CONFIG.SHEETS.SAME_DAY}」には「${CONFIG.HEADERS.ID}」「${CONFIG.HEADERS.PREF}」列が必要です。`);
    }

    const values = sameDaySheet.getRange(2, 1, lastRow - 1, sameDaySheet.getLastColumn()).getValues();
    const context = buildGroupCheckContext_(groupSheet);
    const now = new Date();
    const latestRowsById = buildLatestUnprocessedSameDayRowsById_(values, cols);
    const processingOrder = getSameDayProcessingOrder_(values, cols);
    const pendingPlacements = [];
    const stats = {
      placed: 0,
      movedBc: 0,
      addedBc: 0,
      manual: 0,
      duplicated: 0,
      needsReview: 0,
      errors: 0,
      skipped: 0
    };

    for (const i of processingOrder) {
      const sheetRow = i + 2;
      const row = values[i];
      const currentResult = String(row[cols.result - 1] || '').trim();
      const id = normalizeStudentId_(row[cols.id - 1]);
      const pref = String(row[cols.pref - 1] || '').trim();
      const misplacedNote = currentResult && !isSameDayProcessedResult_(currentResult)
        ? currentResult
        : '';

      if (isSameDayProcessedResult_(currentResult)) {
        stats.skipped++;
        continue;
      }

      if (!id) {
        writeSameDayResult_(sameDaySheet, sheetRow, cols, 'エラー', '', '学籍番号が空です', now);
        stats.errors++;
        continue;
      }

      const latest = latestRowsById.get(id);
      if (latest && latest.index !== i) {
        writeSameDayResult_(sameDaySheet, sheetRow, cols, '重複', '', '同じ学籍番号の新しい当日申請があるため、古い回答をスキップしました', now);
        stats.duplicated++;
        continue;
      }

      if (context.duplicates.has(id)) {
        writeSameDayResult_(
          sameDaySheet,
          sheetRow,
          cols,
          '要確認',
          '',
          `既存グループ表内で重複しています: ${formatDuplicateLocations_(context, id)}`,
          now
        );
        stats.needsReview++;
        continue;
      }

      let current = context.index.get(id);
      const wantsBc = isSameDayBcPref_(pref);

      if (current) {
        if (wantsBc && current.type !== 'bc') {
          removeExistingAssignment_(groupSheet, current);
          context.index.delete(id);

          const bcSection = getSectionByTypeRequired_(context, 'bc');
          const target = appendToListSection_(groupSheet, bcSection, id);
          context.index.set(id, {
            type: 'bc',
            label: CONFIG.LABELS.BC,
            row: target.row,
            col: target.col
          });
          appendSameDayBcParticipant_(bcSheet, row, cols);

          writeSameDayResult_(
            sameDaySheet,
            sheetRow,
            cols,
            'BC移動',
            CONFIG.LABELS.BC,
            appendSameDayNote_(`${formatExistingLocation_(current)} からBCへ移動しました`, misplacedNote),
            now
          );
          stats.movedBc++;
          continue;
        }

        if (current.type === 'reapply' || current.type === 'manual') {
          pendingPlacements.push({
            id,
            sheetRow,
            coolCandidates: getSameDayCoolCandidates_(pref),
            sourceAssignment: current,
            movedFromReapply: current.type === 'reapply'
          });
          continue;
        }

        writeSameDayResult_(
          sameDaySheet,
          sheetRow,
          cols,
          '重複',
          formatExistingLocation_(current),
          current.type === 'bc' ? '既にBCにいます' : '既にグループ分け表にいます',
          now
        );
        stats.duplicated++;
        continue;
      }

      if (wantsBc) {
        const bcSection = getSectionByTypeRequired_(context, 'bc');
        const target = appendToListSection_(groupSheet, bcSection, id);
        context.index.set(id, {
          type: 'bc',
          label: CONFIG.LABELS.BC,
          row: target.row,
          col: target.col
        });
        appendSameDayBcParticipant_(bcSheet, row, cols);

        writeSameDayResult_(
          sameDaySheet,
          sheetRow,
          cols,
          'BC追加',
          CONFIG.LABELS.BC,
          appendSameDayNote_('BCへ追加しました', misplacedNote),
          now
        );
        stats.addedBc++;
        continue;
      }

      pendingPlacements.push({
        id,
        sheetRow,
        coolCandidates: getSameDayCoolCandidates_(pref),
        sourceAssignment: null,
        movedFromReapply: false
      });
    }

    processPendingSameDayPlacements_(groupSheet, sameDaySheet, context, pendingPlacements, cols, stats, now);

    SpreadsheetApp.flush();
    SpreadsheetApp.getUi().alert(
      '当日申請の反映が完了しました。\n\n' +
      `配置済み: ${stats.placed}\n` +
      `BC移動: ${stats.movedBc}\n` +
      `BC追加: ${stats.addedBc}\n` +
      `手動割り当て: ${stats.manual}\n` +
      `重複: ${stats.duplicated}\n` +
      `要確認: ${stats.needsReview}\n` +
      `エラー: ${stats.errors}\n` +
      `処理済みスキップ: ${stats.skipped}\n\n` +
      '確認後、必要なら「今すぐ学生に公開」を実行してください。'
    );
  } finally {
    lock.releaseLock();
  }
}


/*************************************************
 *  フォーム受付（2フォーム対応）
 *************************************************/
function getCoolForm_() {
  return FormApp.openById(CONFIG.COOL_FORM_ID);
}

function getPasswordForm_() {
  return FormApp.openById(CONFIG.PASSWORD_FORM_ID);
}

function openCoolFormNow() {
  getCoolForm_().setAcceptingResponses(true);
  SpreadsheetApp.getUi().alert('クール申請フォームの回答受付を開始しました。');
}

function closeCoolFormNow() {
  getCoolForm_().setAcceptingResponses(false);
  SpreadsheetApp.getUi().alert('クール申請フォームの回答受付を停止しました。');
}

function openPasswordFormNow() {
  getPasswordForm_().setAcceptingResponses(true);
  SpreadsheetApp.getUi().alert('パスワードフォームの回答受付を開始しました。');
}

function closePasswordFormNow() {
  getPasswordForm_().setAcceptingResponses(false);
  SpreadsheetApp.getUi().alert('パスワードフォームの回答受付を停止しました。');
}

function openCoolFormTriggerSafe() {
  try {
    getCoolForm_().setAcceptingResponses(true);
    autoScheduleNextWeek_(PROP_KEYS.COOL_OPEN_AT, scheduleCoolFormOpenAt);
  } catch (e) { Logger.log(e); }
}
function closeCoolFormTriggerSafe() {
  try {
    getCoolForm_().setAcceptingResponses(false);
    autoScheduleNextWeek_(PROP_KEYS.COOL_CLOSE_AT, scheduleCoolFormCloseAt);
  } catch (e) { Logger.log(e); }
}
function openPasswordFormTriggerSafe() {
  try {
    getPasswordForm_().setAcceptingResponses(true);
    autoScheduleNextWeek_(PROP_KEYS.PASS_OPEN_AT, schedulePasswordFormOpenAt);
  } catch (e) { Logger.log(e); }
}
function closePasswordFormTriggerSafe() {
  try {
    getPasswordForm_().setAcceptingResponses(false);
    autoScheduleNextWeek_(PROP_KEYS.PASS_CLOSE_AT, schedulePasswordFormCloseAt);
  } catch (e) { Logger.log(e); }
}

function scheduleCoolFormOpenAt(date) {
  validateFutureDate_(date, '開始時刻');
  deleteTriggerByStoredId_(PROP_KEYS.COOL_OPEN_TRIGGER_ID);
  const trig = ScriptApp.newTrigger('openCoolFormTriggerSafe').timeBased().at(date).create();
  storeTrigger_(PROP_KEYS.COOL_OPEN_TRIGGER_ID, PROP_KEYS.COOL_OPEN_AT, trig, date);
}

function scheduleCoolFormCloseAt(date) {
  validateFutureDate_(date, '締切時刻');
  deleteTriggerByStoredId_(PROP_KEYS.COOL_CLOSE_TRIGGER_ID);
  const trig = ScriptApp.newTrigger('closeCoolFormTriggerSafe').timeBased().at(date).create();
  storeTrigger_(PROP_KEYS.COOL_CLOSE_TRIGGER_ID, PROP_KEYS.COOL_CLOSE_AT, trig, date);
}

function schedulePasswordFormOpenAt(date) {
  validateFutureDate_(date, '開始時刻');
  deleteTriggerByStoredId_(PROP_KEYS.PASS_OPEN_TRIGGER_ID);
  const trig = ScriptApp.newTrigger('openPasswordFormTriggerSafe').timeBased().at(date).create();
  storeTrigger_(PROP_KEYS.PASS_OPEN_TRIGGER_ID, PROP_KEYS.PASS_OPEN_AT, trig, date);
}

function schedulePasswordFormCloseAt(date) {
  validateFutureDate_(date, '締切時刻');
  deleteTriggerByStoredId_(PROP_KEYS.PASS_CLOSE_TRIGGER_ID);
  const trig = ScriptApp.newTrigger('closePasswordFormTriggerSafe').timeBased().at(date).create();
  storeTrigger_(PROP_KEYS.PASS_CLOSE_TRIGGER_ID, PROP_KEYS.PASS_CLOSE_AT, trig, date);
}

function cancelAllFormSchedules() {
  deleteTriggerByStoredId_(PROP_KEYS.COOL_OPEN_TRIGGER_ID);
  deleteTriggerByStoredId_(PROP_KEYS.COOL_CLOSE_TRIGGER_ID);
  deleteTriggerByStoredId_(PROP_KEYS.PASS_OPEN_TRIGGER_ID);
  deleteTriggerByStoredId_(PROP_KEYS.PASS_CLOSE_TRIGGER_ID);

  deleteProperty_(PROP_KEYS.COOL_OPEN_AT);
  deleteProperty_(PROP_KEYS.COOL_CLOSE_AT);
  deleteProperty_(PROP_KEYS.PASS_OPEN_AT);
  deleteProperty_(PROP_KEYS.PASS_CLOSE_AT);

  SpreadsheetApp.getUi().alert('フォーム予約をすべて取消しました。');
}


function promptScheduleFormsWindow() {
  const ui = SpreadsheetApp.getUi();

  const coolOpenExample = formatJST_(new Date(Date.now() + 30 * 60 * 1000)).slice(0, 16);
  const coolCloseExample = formatJST_(new Date(Date.now() + 90 * 60 * 1000)).slice(0, 16);

  const res1 = ui.prompt('クール申請フォーム開始日時', `例）${coolOpenExample}\n形式：YYYY/MM/DD HH:mm（空欄なら設定しない）`, ui.ButtonSet.OK_CANCEL);
  if (res1.getSelectedButton() !== ui.Button.OK) return;
  const res2 = ui.prompt('クール申請フォーム締切日時', `例）${coolCloseExample}\n形式：YYYY/MM/DD HH:mm（空欄なら設定しない）`, ui.ButtonSet.OK_CANCEL);
  if (res2.getSelectedButton() !== ui.Button.OK) return;

  const res3 = ui.prompt('パスワードフォーム開始日時', `形式：YYYY/MM/DD HH:mm（空欄なら設定しない）`, ui.ButtonSet.OK_CANCEL);
  if (res3.getSelectedButton() !== ui.Button.OK) return;
  const res4 = ui.prompt('パスワードフォーム締切日時', `形式：YYYY/MM/DD HH:mm（空欄なら設定しない）`, ui.ButtonSet.OK_CANCEL);
  if (res4.getSelectedButton() !== ui.Button.OK) return;

  try {
    if (res1.getResponseText().trim()) scheduleCoolFormOpenAt(parseJST_YYYYMMDD_HHMM_(res1.getResponseText().trim()));
    if (res2.getResponseText().trim()) scheduleCoolFormCloseAt(parseJST_YYYYMMDD_HHMM_(res2.getResponseText().trim()));
    if (res3.getResponseText().trim()) schedulePasswordFormOpenAt(parseJST_YYYYMMDD_HHMM_(res3.getResponseText().trim()));
    if (res4.getResponseText().trim()) schedulePasswordFormCloseAt(parseJST_YYYYMMDD_HHMM_(res4.getResponseText().trim()));

    ui.alert('フォーム受付予約を更新しました。');
  } catch (e) {
    ui.alert('予約に失敗しました', String(e), ui.ButtonSet.OK);
  }
}

function showFormWindowSchedule() {
  const prop = PropertiesService.getScriptProperties();
  const lines = [
    prop.getProperty(PROP_KEYS.COOL_OPEN_AT) ? `クール申請 開始：${formatJST_(new Date(prop.getProperty(PROP_KEYS.COOL_OPEN_AT)))}` : 'クール申請 開始：未設定',
    prop.getProperty(PROP_KEYS.COOL_CLOSE_AT) ? `クール申請 締切：${formatJST_(new Date(prop.getProperty(PROP_KEYS.COOL_CLOSE_AT)))}` : 'クール申請 締切：未設定',
    prop.getProperty(PROP_KEYS.PASS_OPEN_AT) ? `パスワード 開始：${formatJST_(new Date(prop.getProperty(PROP_KEYS.PASS_OPEN_AT)))}` : 'パスワード 開始：未設定',
    prop.getProperty(PROP_KEYS.PASS_CLOSE_AT) ? `パスワード 締切：${formatJST_(new Date(prop.getProperty(PROP_KEYS.PASS_CLOSE_AT)))}` : 'パスワード 締切：未設定'
  ];
  SpreadsheetApp.getUi().alert(lines.join('\n'));
}


/*************************************************
 *  週次スケジュール
 *************************************************/
function createWeeklyAutomation() {
  cancelWeeklyAutomation(true);

  const settings = {};

  if (CONFIG.WEEKLY_SCHEDULE.coolFormOpen.enabled) {
    const at = getNextWeekdayTimeJST_(CONFIG.WEEKLY_SCHEDULE.coolFormOpen.day, CONFIG.WEEKLY_SCHEDULE.coolFormOpen.hour, CONFIG.WEEKLY_SCHEDULE.coolFormOpen.minute);
    scheduleCoolFormOpenAt(at);
    settings.coolFormOpen = {
      label: 'クール申請フォーム開始',
      day: DAY_NAMES[CONFIG.WEEKLY_SCHEDULE.coolFormOpen.day],
      hour: CONFIG.WEEKLY_SCHEDULE.coolFormOpen.hour,
      minute: CONFIG.WEEKLY_SCHEDULE.coolFormOpen.minute
    };
  }

  if (CONFIG.WEEKLY_SCHEDULE.coolFormClose.enabled) {
    const at = getNextWeekdayTimeJST_(CONFIG.WEEKLY_SCHEDULE.coolFormClose.day, CONFIG.WEEKLY_SCHEDULE.coolFormClose.hour, CONFIG.WEEKLY_SCHEDULE.coolFormClose.minute);
    scheduleCoolFormCloseAt(at);
    settings.coolFormClose = {
      label: 'クール申請フォーム締切',
      day: DAY_NAMES[CONFIG.WEEKLY_SCHEDULE.coolFormClose.day],
      hour: CONFIG.WEEKLY_SCHEDULE.coolFormClose.hour,
      minute: CONFIG.WEEKLY_SCHEDULE.coolFormClose.minute
    };
  }

  if (CONFIG.WEEKLY_SCHEDULE.passwordFormOpen.enabled) {
    const at = getNextWeekdayTimeJST_(CONFIG.WEEKLY_SCHEDULE.passwordFormOpen.day, CONFIG.WEEKLY_SCHEDULE.passwordFormOpen.hour, CONFIG.WEEKLY_SCHEDULE.passwordFormOpen.minute);
    schedulePasswordFormOpenAt(at);
    settings.passwordFormOpen = {
      label: 'パスワードフォーム開始',
      day: DAY_NAMES[CONFIG.WEEKLY_SCHEDULE.passwordFormOpen.day],
      hour: CONFIG.WEEKLY_SCHEDULE.passwordFormOpen.hour,
      minute: CONFIG.WEEKLY_SCHEDULE.passwordFormOpen.minute
    };
  }

  if (CONFIG.WEEKLY_SCHEDULE.passwordFormClose.enabled) {
    const at = getNextWeekdayTimeJST_(CONFIG.WEEKLY_SCHEDULE.passwordFormClose.day, CONFIG.WEEKLY_SCHEDULE.passwordFormClose.hour, CONFIG.WEEKLY_SCHEDULE.passwordFormClose.minute);
    schedulePasswordFormCloseAt(at);
    settings.passwordFormClose = {
      label: 'パスワードフォーム締切',
      day: DAY_NAMES[CONFIG.WEEKLY_SCHEDULE.passwordFormClose.day],
      hour: CONFIG.WEEKLY_SCHEDULE.passwordFormClose.hour,
      minute: CONFIG.WEEKLY_SCHEDULE.passwordFormClose.minute
    };
  }

  if (CONFIG.WEEKLY_SCHEDULE.makeRandomGroups && CONFIG.WEEKLY_SCHEDULE.makeRandomGroups.enabled) {
    const at = getNextWeekdayTimeJST_(CONFIG.WEEKLY_SCHEDULE.makeRandomGroups.day, CONFIG.WEEKLY_SCHEDULE.makeRandomGroups.hour, CONFIG.WEEKLY_SCHEDULE.makeRandomGroups.minute);
    scheduleMakeRandomGroupsAt(at);
    settings.makeRandomGroups = {
      label: 'グループ分け（確認修正用）',
      day: DAY_NAMES[CONFIG.WEEKLY_SCHEDULE.makeRandomGroups.day],
      hour: CONFIG.WEEKLY_SCHEDULE.makeRandomGroups.hour,
      minute: CONFIG.WEEKLY_SCHEDULE.makeRandomGroups.minute
    };
  }

  if (CONFIG.WEEKLY_SCHEDULE.groupPublish.enabled) {
    const at = getNextWeekdayTimeJST_(CONFIG.WEEKLY_SCHEDULE.groupPublish.day, CONFIG.WEEKLY_SCHEDULE.groupPublish.hour, CONFIG.WEEKLY_SCHEDULE.groupPublish.minute);
    scheduleGroupPublishAt(at);
    settings.groupPublish = {
      label: 'グループ公開',
      day: DAY_NAMES[CONFIG.WEEKLY_SCHEDULE.groupPublish.day],
      hour: CONFIG.WEEKLY_SCHEDULE.groupPublish.hour,
      minute: CONFIG.WEEKLY_SCHEDULE.groupPublish.minute
    };
  }

  if (CONFIG.WEEKLY_SCHEDULE.reset.enabled) {
    const at = getNextWeekdayTimeJST_(CONFIG.WEEKLY_SCHEDULE.reset.day, CONFIG.WEEKLY_SCHEDULE.reset.hour, CONFIG.WEEKLY_SCHEDULE.reset.minute);
    scheduleResetAt_(at);
    settings.reset = {
      label: 'クール申請関連データ初期化',
      day: DAY_NAMES[CONFIG.WEEKLY_SCHEDULE.reset.day],
      hour: CONFIG.WEEKLY_SCHEDULE.reset.hour,
      minute: CONFIG.WEEKLY_SCHEDULE.reset.minute
    };
  }

  PropertiesService.getScriptProperties().setProperty(PROP_KEYS.WEEKLY_SETTINGS, JSON.stringify(settings));
  SpreadsheetApp.getUi().alert('週次スケジュールを登録しました。');
}

function cancelWeeklyAutomation(silent) {
  deleteAllTimeBasedTriggers_();

  deleteProperty_(PROP_KEYS.WEEKLY_SETTINGS);

  // 各種プロパティも削除
  deleteProperty_(PROP_KEYS.COOL_OPEN_AT);
  deleteProperty_(PROP_KEYS.COOL_CLOSE_AT);
  deleteProperty_(PROP_KEYS.MAKE_RANDOM_GROUPS_AT);
  deleteProperty_(PROP_KEYS.GROUP_PUBLISH_AT);
  deleteProperty_(PROP_KEYS.RESET_AT);

  deleteProperty_(PROP_KEYS.COOL_OPEN_TRIGGER_ID);
  deleteProperty_(PROP_KEYS.COOL_CLOSE_TRIGGER_ID);
  deleteProperty_(PROP_KEYS.MAKE_RANDOM_GROUPS_TRIGGER_ID);
  deleteProperty_(PROP_KEYS.GROUP_PUBLISH_TRIGGER_ID);
  deleteProperty_(PROP_KEYS.RESET_TRIGGER_ID);

  if (!silent) {
    try {
      SpreadsheetApp.getUi().alert('週次スケジュールとすべての時間ベース予約を強制解除しました。');
    } catch(e) {}
  }
}

function deleteAllTimeBasedTriggers_() {
  // 初回パスワード送信（sendInitialPasswordsScheduled）は週次スケジュールとは
  // 独立して管理する。createWeeklyAutomation が内部で cancelWeeklyAutomation を
  // 呼ぶため、ここに含めると初回配布中に週次登録し直すとトリガーが消えてしまう。
  // 解除は「③初回パスワード送信 → 分割送信を中止」で行う。
  const targetFunctions = [
    'openCoolFormTriggerSafe',
    'closeCoolFormTriggerSafe',
    'makeRandomGroupsTriggerSafe',
    'publishGroupsNowTriggerSafe',
    'resetAllDataSafe'
  ];

  const triggers = ScriptApp.getProjectTriggers();
  for (const t of triggers) {
    if (t.getEventType() === ScriptApp.EventType.CLOCK) {
      if (targetFunctions.includes(t.getHandlerFunction())) {
        ScriptApp.deleteTrigger(t);
      }
    }
  }
}

function showWeeklyAutomationStatus() {
  const data = JSON.parse(PropertiesService.getScriptProperties().getProperty(PROP_KEYS.WEEKLY_SETTINGS) || '{}');
  const lines = [];
  for (const info of Object.values(data)) {
    lines.push(`${info.label}\n毎週${info.day}曜 ${String(info.hour).padStart(2,'0')}:${String(info.minute).padStart(2,'0')}`);
  }
  SpreadsheetApp.getUi().alert(lines.length ? lines.join('\n\n') : '週次スケジュールは設定されていません。');
}

function scheduleResetAt_(date) {
  validateFutureDate_(date, '初期化時刻');
  cancelResetSchedule_();

  const trig = ScriptApp.newTrigger('resetAllDataSafe').timeBased().at(date).create();
  const prop = PropertiesService.getScriptProperties();
  prop.setProperty(PROP_KEYS.RESET_TRIGGER_ID, trig.getUniqueId());
  prop.setProperty(PROP_KEYS.RESET_AT, date.toISOString());
}

function cancelResetSchedule_() {
  deleteTriggerByStoredId_(PROP_KEYS.RESET_TRIGGER_ID);
  deleteProperty_(PROP_KEYS.RESET_AT);
}

function scheduleMakeRandomGroupsAt(date) {
  validateFutureDate_(date, 'グループ分け実行時刻');
  deleteTriggerByStoredId_(PROP_KEYS.MAKE_RANDOM_GROUPS_TRIGGER_ID);
  const trig = ScriptApp.newTrigger('makeRandomGroupsTriggerSafe').timeBased().at(date).create();
  storeTrigger_(PROP_KEYS.MAKE_RANDOM_GROUPS_TRIGGER_ID, PROP_KEYS.MAKE_RANDOM_GROUPS_AT, trig, date);
}

function cancelMakeRandomGroupsSchedule() {
  deleteTriggerByStoredId_(PROP_KEYS.MAKE_RANDOM_GROUPS_TRIGGER_ID);
  deleteProperty_(PROP_KEYS.MAKE_RANDOM_GROUPS_AT);
}


/*************************************************
 *  初期化
 *************************************************/
function resetDerivedSheets() {
  const adminSS = SpreadsheetApp.openById(CONFIG.ADMIN_SPREADSHEET_ID);

  clearKeepHeader_(getSheetByNameRequired_(adminSS, CONFIG.SHEETS.VALID));
  clearKeepHeader_(getSheetByNameRequired_(adminSS, CONFIG.SHEETS.INVALID));
  clearKeepHeader_(getSheetByNameRequired_(adminSS, CONFIG.SHEETS.BC));
  clearSheet_(getSheetByNameRequired_(adminSS, CONFIG.SHEETS.GROUP_CHECK));

  const roster = getStudentRosterSheet_();
  writeRoster_(roster, ...emptyBuckets_());
  resetStudentGroupSheet_();

  SpreadsheetApp.getUi().alert('派生シートを初期化しました。');
}

function resetAllData() {
  const ui = SpreadsheetApp.getUi();
  const res = ui.alert(
    'クール申請関連データ初期化',
    'クール申請フォームのGoogle Form本体の回答、回答シート、有効申請、無効申請、当日申請、BC参加者、グループ分け確認修正用、学生共有用シートを初期化します。\nパスワードフォームの回答、学籍・パスワード一覧、パスワードログは残します。\n実行してよろしいですか？',
    ui.ButtonSet.YES_NO
  );
  if (res !== ui.Button.YES) return;
  // 手動実行では翌週予約を動かさない（動かすと次回リセットが1週間後ろへずれる）
  resetAllDataCore_();
  ui.alert('クール申請関連データの初期化が完了しました。');
}

// 週次トリガー専用。手動実行は resetAllData（予約を変更しない）を使うこと。
function resetAllDataSafe() {
  // ⚠️ バグ修正：翌週予約の失敗とデータ初期化の失敗を分離。
  // 翌週予約が失敗してもデータ初期化は必ず実行する。
  try {
    autoScheduleNextWeek_(PROP_KEYS.RESET_AT, scheduleResetAt_, 'reset');
  } catch (e) {
    Logger.log('⚠️ 翌週トリガーの自動予約に失敗しました（データ初期化は続行）: ' + e);
  }

  resetAllDataCore_();
}

function resetAllDataCore_() {
  try {
    // Google Form本体の回答削除はクール申請フォームのみ
    deleteCoolFormResponsesOnly_();

    // 回答シート削除もクール申請フォームのみ
    clearFormResponsesBySheetName_(CONFIG.SHEETS.COOL_RESPONSES);

    // 派生シートを初期化
    const adminSS = SpreadsheetApp.openById(CONFIG.ADMIN_SPREADSHEET_ID);
    clearKeepHeader_(getSheetByNameRequired_(adminSS, CONFIG.SHEETS.VALID));
    clearKeepHeader_(getSheetByNameRequired_(adminSS, CONFIG.SHEETS.INVALID));
    clearKeepHeader_(getSheetByNameRequired_(adminSS, CONFIG.SHEETS.SAME_DAY));
    clearKeepHeader_(getSheetByNameRequired_(adminSS, CONFIG.SHEETS.BC));
    clearSheet_(getSheetByNameRequired_(adminSS, CONFIG.SHEETS.GROUP_CHECK));

    // 学生共有用を初期化
    const roster = getStudentRosterSheet_();
    writeRoster_(roster, ...emptyBuckets_());
    resetStudentGroupSheet_();

    Logger.log('✅ クール申請関連データの初期化が完了しました。');
  } catch (e) {
    Logger.log('⚠️ 初期化中にエラーが発生: ' + e);
  }
}

function deleteCoolFormResponsesOnly_() {
  try {
    getCoolForm_().deleteAllResponses();
    Logger.log('クール申請フォーム本体の回答を削除しました。');
  } catch (e) {
    Logger.log('⚠️ クール申請フォーム本体の回答削除に失敗: ' + e);
  }
}


/*************************************************
 *  学生共有用：クール分け出力
 *************************************************/
function writeRoster_(sheet, ...cols) {
  const col1 = cols[0] || [];
  const col2 = cols[1] || [];
  const col3 = cols[2] || [];
  const col4 = (CONFIG.TOTAL_COOLS >= 4) ? (cols[3] || []) : [];
  const colBC = cols[CONFIG.TOTAL_COOLS] || [];
  const colReapply = cols[CONFIG.TOTAL_COOLS + 1] || [];

  sheet.clear();

  const headers = (CONFIG.TOTAL_COOLS >= 4)
    ? [coolLabel_(1), coolLabel_(2), coolLabel_(3), coolLabel_(4), CONFIG.LABELS.BC, CONFIG.LABELS.REAPPLY]
    : [coolLabel_(1), coolLabel_(2), coolLabel_(3), CONFIG.LABELS.BC, CONFIG.LABELS.REAPPLY];

  sheet.getRange(1, 1, 1, headers.length)
    .setValues([headers])
    .setFontWeight('bold')
    .setHorizontalAlignment('center');

  pasteColumn_(sheet, 2, 1, col1);
  pasteColumn_(sheet, 2, 2, col2);
  pasteColumn_(sheet, 2, 3, col3);
  if (CONFIG.TOTAL_COOLS >= 4) pasteColumn_(sheet, 2, 4, col4);

  const bcCol = (CONFIG.TOTAL_COOLS >= 4) ? 5 : 4;
  const reapplyCol = bcCol + 1;
  pasteColumn_(sheet, 2, bcCol, colBC);
  pasteColumn_(sheet, 2, reapplyCol, colReapply);

  sheet.setColumnWidths(1, headers.length, 100);

  const capacity = CONFIG.TEAMS_PER_COHORT * CONFIG.MEMBERS_PER_TEAM;
  const totalRequiredRows = 1 + capacity;
  const currentMaxRows = sheet.getMaxRows();
  if (currentMaxRows < totalRequiredRows) {
    sheet.insertRowsAfter(currentMaxRows, totalRequiredRows - currentMaxRows);
  }

  const color = '#d8e5ff';
  for (let c = 1; c <= CONFIG.TOTAL_COOLS; c++) {
    sheet.getRange(2, c, capacity, 1).setBackground(color);
  }
}

function emptyBuckets_() {
  const cools = Array.from({ length: CONFIG.TOTAL_COOLS }, () => []);
  return [...cools, [], []];
}


/*************************************************
 *  学生共有用：グループ分け初期化
 *************************************************/
function resetStudentGroupSheet_() {
  const studentSS = SpreadsheetApp.openById(CONFIG.STUDENT_SPREADSHEET_ID);
  let out = studentSS.getSheetByName(CONFIG.STUDENT_SHEETS.GROUPS);
  if (!out) out = studentSS.insertSheet(CONFIG.STUDENT_SHEETS.GROUPS);

  out.clear();

  const titleRow = [];
  for (let i = 0; i < CONFIG.TOTAL_COOLS; i++) titleRow.push(`【${coolLabel_(i + 1)}】`, '', '');
  titleRow.push(
    `【${CONFIG.LABELS.BC}】`, '',
    `【${CONFIG.LABELS.REAPPLY}】`, '',
    `【${CONFIG.LABELS.MANUAL}】`, ''
  );
  out.getRange(1, 1, 1, titleRow.length).setValues([titleRow]).setFontWeight('bold');

  const headRow = [];
  for (let i = 0; i < CONFIG.TOTAL_COOLS; i++) headRow.push('グループ番号', '学籍番号', '');
  headRow.push('学籍番号', '', '学籍番号', '', '学籍番号', '');
  out.getRange(2, 1, 1, headRow.length).setValues([headRow]).setFontWeight('bold');

  let c = 1;
  for (let i = 0; i < CONFIG.TOTAL_COOLS; i++) {
    out.setColumnWidth(c++, 100);
    out.setColumnWidth(c++, 100);
    out.setColumnWidth(c++, 40);
  }
  out.setColumnWidth(c++, 100); out.setColumnWidth(c++, 40);
  out.setColumnWidth(c++, 100); out.setColumnWidth(c++, 40);
  out.setColumnWidth(c++, 100); out.setColumnWidth(c++, 40);
}


/*************************************************
 *  共通ユーティリティ
 *************************************************/
function getStudentRosterSheet_() {
  const studentSS = SpreadsheetApp.openById(CONFIG.STUDENT_SPREADSHEET_ID);
  const byGid = getSheetById_(studentSS, CONFIG.STUDENT_ROSTER_SHEET_GID);
  if (byGid) {
    if (byGid.getName() !== CONFIG.STUDENT_SHEETS.ROSTER) {
      byGid.setName(CONFIG.STUDENT_SHEETS.ROSTER);
    }
    return byGid;
  }

  const byName = studentSS.getSheetByName(CONFIG.STUDENT_SHEETS.ROSTER);
  if (byName) return byName;

  return studentSS.insertSheet(CONFIG.STUDENT_SHEETS.ROSTER);
}

function ensureSheetHeader_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);

  if (headers && headers.length > 0) {
    const currentHeader = sh.getLastRow() > 0
      ? sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), headers.length)).getValues()[0].slice(0, headers.length)
      : [];
    const same = JSON.stringify(currentHeader) === JSON.stringify(headers);
    if (!same) {
      sh.clear();
      sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    }
  }
  return sh;
}

function ensureSameDayApplicationSheet_() {
  const ss = SpreadsheetApp.openById(CONFIG.ADMIN_SPREADSHEET_ID);
  let sh = ss.getSheetByName(CONFIG.SHEETS.SAME_DAY);
  if (!sh) sh = ss.insertSheet(CONFIG.SHEETS.SAME_DAY);

  if (sh.getLastRow() < 1 || sh.getLastColumn() < 1) {
    sh.getRange(1, 1, 1, SAME_DAY_HEADERS.length).setValues([SAME_DAY_HEADERS]).setFontWeight('bold');
    return sh;
  }

  const header = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String);
  for (const h of SAME_DAY_HEADERS) {
    if (!header.some(current => sameDayHeaderEquals_(current, h))) {
      const col = sh.getLastColumn() + 1;
      ensureSheetHasColumn_(sh, col);
      sh.getRange(1, col).setValue(h).setFontWeight('bold');
      header.push(h);
    }
  }

  return sh;
}

function getSheetByNameRequired_(ss, name) {
  const sh = ss.getSheetByName(name);
  if (!sh) throw new Error(`シート「${name}」が見つかりません。`);
  return sh;
}

function getSheetById_(ss, gid) {
  for (const sh of ss.getSheets()) {
    if (sh.getSheetId() === gid) return sh;
  }
  return null;
}

function clearKeepHeader_(sheet) {
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow > 1 && lastCol > 0) {
    sheet.getRange(2, 1, lastRow - 1, lastCol).clearContent();
  }
}

function clearSheet_(sheet) {
  sheet.clear();
}


/*************************************************
 *  当日申請ユーティリティ：回答シート
 *************************************************/
function getSameDayColumnIndexes_(sheet) {
  const header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
  return {
    ts: findHeaderIndex1Based_(header, CONFIG.HEADERS.TS),
    id: findHeaderIndex1Based_(header, CONFIG.HEADERS.ID),
    name: findHeaderIndex1Based_(header, CONFIG.HEADERS.NAME),
    pref: findHeaderIndex1Based_(header, CONFIG.HEADERS.PREF),
    reason: findHeaderIndex1Based_(header, 'BCに参加する学生はBCに参加する理由を書いてください'),
    result: findHeaderIndex1Based_(header, '処理結果'),
    placement: findHeaderIndex1Based_(header, '配置先'),
    note: findHeaderIndex1Based_(header, '備考'),
    processedAt: findHeaderIndex1Based_(header, '処理日時')
  };
}

function appendSameDayBcParticipant_(bcSheet, sameDayRow, cols) {
  const participant = buildSameDayBcParticipantRow_(sameDayRow, cols);
  const id = normalizeBcParticipantId_(participant[0]);
  if (!id) return;

  const lastRow = bcSheet.getLastRow();
  if (lastRow > 1) {
    const existingIds = bcSheet.getRange(2, 1, lastRow - 1, 1)
      .getValues()
      .flat()
      .map(normalizeBcParticipantId_);
    if (existingIds.includes(id)) return;
  }

  appendRow_(bcSheet, participant);
}

function getProcessedSameDayBcParticipantRows_(sameDaySheet) {
  if (!sameDaySheet || sameDaySheet.getLastRow() <= 1) return [];

  const cols = getSameDayColumnIndexes_(sameDaySheet);
  if (cols.id < 1 || cols.result < 1) return [];

  const values = sameDaySheet
    .getRange(2, 1, sameDaySheet.getLastRow() - 1, sameDaySheet.getLastColumn())
    .getValues();
  const rows = [];
  const includedIds = new Set();

  for (const row of values) {
    const result = normalizePref_(row[cols.result - 1]);
    const isProcessedBc = ['BC移動', 'BC追加']
      .some(status => result === normalizePref_(status));
    if (!isProcessedBc) continue;

    const participant = buildSameDayBcParticipantRow_(row, cols);
    const id = normalizeBcParticipantId_(participant[0]);
    if (!id || includedIds.has(id)) continue;

    rows.push(participant);
    includedIds.add(id);
  }

  return rows;
}

function buildSameDayBcParticipantRow_(sameDayRow, cols) {
  const id = normalizeStudentId_(sameDayRow[cols.id - 1]);
  const name = cols.name > 0 ? String(sameDayRow[cols.name - 1] || '').trim() : '';
  const reason = cols.reason > 0 ? String(sameDayRow[cols.reason - 1] || '').trim() : '';
  return ["'" + id, name, reason, ''];
}

function normalizeBcParticipantId_(value) {
  return normalizeStudentId_(String(value || '').replace(/^'/, ''));
}

function findHeaderIndex1Based_(headers, target) {
  const idx = headers.findIndex(h => sameDayHeaderEquals_(h, target));
  return idx + 1;
}

function sameDayHeaderEquals_(a, b) {
  return normalizePref_(a) === normalizePref_(b);
}

function buildLatestUnprocessedSameDayRowsById_(values, cols) {
  const latest = new Map();
  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    const currentResult = String(row[cols.result - 1] || '').trim();
    if (isSameDayProcessedResult_(currentResult)) continue;

    const id = normalizeStudentId_(row[cols.id - 1]);
    if (!id) continue;

    const ts = cols.ts > 0 ? toTime_(row[cols.ts - 1]) : 0;
    const prev = latest.get(id);
    if (!prev || ts > prev.ts || (ts === prev.ts && i > prev.index)) {
      latest.set(id, { index: i, ts });
    }
  }
  return latest;
}

function isSameDayProcessedResult_(value) {
  const result = normalizePref_(value);
  // 「手動割り当て」は再実行時に自動配置を試すため、処理済みには含めない。
  return [
    '配置済み',
    'BC移動',
    'BC追加',
    '重複',
    '要確認',
    'エラー'
  ].some(status => result === normalizePref_(status));
}

function appendSameDayNote_(base, extra) {
  const note = String(extra || '').trim();
  return note ? `${base} / 申請メモ: ${note}` : base;
}

function getSameDayProcessingOrder_(values, cols) {
  return values
    .map((row, index) => ({
      index,
      ts: cols.ts > 0 ? toTime_(row[cols.ts - 1]) : 0
    }))
    .sort((a, b) => {
      if (a.ts !== b.ts) return a.ts - b.ts;
      return a.index - b.index;
    })
    .map(item => item.index);
}

function writeSameDayResult_(sheet, row, cols, result, placement, note, processedAt) {
  sheet.getRange(row, cols.result).setValue(result);
  sheet.getRange(row, cols.placement).setValue(placement || '');
  sheet.getRange(row, cols.note).setValue(note || '');
  sheet.getRange(row, cols.processedAt)
    .setValue(processedAt || new Date())
    .setNumberFormat('yyyy/MM/dd HH:mm:ss');
}


/*************************************************
 *  当日申請ユーティリティ：グループ表解析
 *************************************************/
function buildGroupCheckContext_(sheet) {
  const lastCol = sheet.getLastColumn();
  const lastRow = sheet.getLastRow();
  if (lastCol < 1 || lastRow < 2) {
    throw new Error(`「${CONFIG.SHEETS.GROUP_CHECK}」にグループ表がありません。`);
  }

  const titleRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const sections = [];
  for (let c = 1; c <= lastCol; c++) {
    const label = stripBlockTitle_(titleRow[c - 1]);
    if (!label) continue;

    const coolNo = parseCoolLabelNo_(label);
    if (coolNo) {
      sections.push({
        type: 'cool',
        label,
        coolNo,
        startCol: c,
        groupCol: c,
        idCol: c + 1,
        width: 3
      });
    } else if (normalizePref_(label) === normalizePref_(CONFIG.LABELS.BC)) {
      sections.push({ type: 'bc', label, startCol: c, idCol: c, width: 2 });
    } else if (normalizePref_(label) === normalizePref_(CONFIG.LABELS.REAPPLY)) {
      sections.push({ type: 'reapply', label, startCol: c, idCol: c, width: 2 });
    } else if (normalizePref_(label) === normalizePref_(CONFIG.LABELS.MANUAL)) {
      sections.push({ type: 'manual', label, startCol: c, idCol: c, width: 2 });
    }
  }

  const index = new Map();
  const duplicates = new Map();
  for (const section of sections) {
    if (section.type === 'cool') {
      const rows = sheet.getRange(3, section.groupCol, Math.max(lastRow - 2, 1), 2).getValues();
      for (let i = 0; i < rows.length; i++) {
        const groupNo = rows[i][0];
        const id = normalizeStudentId_(rows[i][1]);
        if (!id) continue;
        addGroupIndexEntry_(index, duplicates, id, {
          type: 'cool',
          label: section.label,
          groupNo,
          row: i + 3,
          col: section.idCol
        });
      }
    } else {
      const values = sheet.getRange(3, section.idCol, Math.max(lastRow - 2, 1), 1).getValues();
      for (let i = 0; i < values.length; i++) {
        const id = normalizeStudentId_(values[i][0]);
        if (!id) continue;
        addGroupIndexEntry_(index, duplicates, id, {
          type: section.type,
          label: section.label,
          row: i + 3,
          col: section.idCol
        });
      }
    }
  }

  return { sections, index, duplicates };
}

function addGroupIndexEntry_(index, duplicates, id, entry) {
  const existing = index.get(id);
  if (!existing) {
    index.set(id, entry);
    return;
  }

  if (!duplicates.has(id)) duplicates.set(id, [existing]);
  duplicates.get(id).push(entry);
}

function stripBlockTitle_(v) {
  return String(v || '').trim().replace(/^【/, '').replace(/】$/, '').trim();
}

function parseCoolLabelNo_(label) {
  const m = String(label || '').match(/^第(\d+)クール$/);
  return m ? Number(m[1]) : 0;
}


/*************************************************
 *  当日申請ユーティリティ：希望判定
 *************************************************/
function prefToCoolNo_(pref) {
  const normalized = normalizePref_(pref);
  for (let i = 1; i <= CONFIG.TOTAL_COOLS; i++) {
    if (normalized === normalizePref_(CONFIG.PREF_VALUE[`COOL${i}`])) return i;
    if (normalized === normalizePref_(coolLabel_(i))) return i;
  }
  return parseCoolLabelNo_(String(pref || '').trim());
}

function getSameDayCoolCandidates_(pref) {
  const sameDayOrder = buildSameDayCoolOrder_();
  const explicitCoolNo = prefToCoolNo_(pref);
  if (explicitCoolNo) {
    if (!sameDayOrder.includes(explicitCoolNo)) return sameDayOrder;
    return [explicitCoolNo, ...sameDayOrder.filter(coolNo => coolNo !== explicitCoolNo)];
  }

  if (isGenericGroupWorkPref_(pref)) {
    return sameDayOrder;
  }

  return [];
}

function isGenericGroupWorkPref_(pref) {
  const normalized = normalizePref_(pref);
  return normalized === normalizePref_('グループワーク参加希望') ||
    normalized === normalizePref_('参加希望') ||
    (normalized.indexOf('グループワーク') >= 0 && normalized.indexOf('参加希望') >= 0);
}

// 予備ロジック：単独の申請者を最初の空き枠へ直接配置する方式に切り替える場合に使用する。
function placeInFirstAvailableCool_(sheet, context, coolCandidates, id, allowEmptyGroups) {
  const target = chooseSameDayCoolSection_(sheet, context, coolCandidates, allowEmptyGroups);
  if (!target) return null;

  const placed = placeInCoolVacancy_(sheet, target.section, id);
  if (placed) {
    placed.coolNo = target.coolNo;
    placed.note = coolCandidates.length > 1
      ? `汎用参加希望のため、候補（${coolCandidates.map(coolLabel_).join('、')}）の優先順で追加しました`
      : '空き枠へ追加しました';
    return placed;
  }

  return null;
}

function chooseSameDayCoolSection_(sheet, context, coolCandidates, allowEmptyGroups) {
  for (let order = 0; order < coolCandidates.length; order++) {
    const coolNo = coolCandidates[order];
    const section = getCoolSection_(context, coolNo);
    if (!section) continue;

    const vacancies = countCoolVacancies_(sheet, section, allowEmptyGroups);
    if (vacancies <= 0) continue;

    return { coolNo, section, vacancies, order };
  }
  return null;
}

function countCoolVacancies_(sheet, section, allowEmptyGroups) {
  return getCoolGroupSummaries_(sheet, section)
    .filter(g => g.memberCount < CONFIG.MEMBERS_PER_TEAM)
    .filter(g => allowEmptyGroups || g.memberCount >= CONFIG.MEMBERS_PER_TEAM - 2)
    .reduce((sum, g) => sum + g.emptyRows.length, 0);
}


/*************************************************
 *  当日申請ユーティリティ：自動配置
 *************************************************/
function processPendingSameDayPlacements_(groupSheet, sameDaySheet, context, pending, cols, stats, now) {
  const unresolved = pending.slice();
  if (!unresolved.length) return;

  const coolOrder = buildSameDayCoolOrder_();
  const availableCoolOrder = coolOrder.filter(coolNo => getCoolSection_(context, coolNo));
  if (!availableCoolOrder.length) {
    throw new Error(
      `当日申請の配置対象（${coolOrder.map(coolLabel_).join('、')}）が「${CONFIG.SHEETS.GROUP_CHECK}」にありません。`
    );
  }

  // まず既存の3人チームなどへ追加し、1人の当日申請でも配置できるようにする。
  for (const coolNo of availableCoolOrder) {
    placePendingIntoExistingCoolVacancies_(groupSheet, sameDaySheet, context, unresolved, cols, stats, now, coolNo);
  }

  // 3人以上残っている場合は、対象クールの空きグループへ新しいチームを作る。
  for (const coolNo of availableCoolOrder) {
    createSameDayThreePersonTeamsInEmptyGroups_(groupSheet, sameDaySheet, context, unresolved, cols, stats, now, coolNo);
  }

  // 新しく作った3人チームにも、残った学生を4人目として配置する。
  for (const coolNo of availableCoolOrder) {
    placePendingIntoExistingCoolVacancies_(groupSheet, sameDaySheet, context, unresolved, cols, stats, now, coolNo);
  }

  const placementSummary = buildSameDayPlacementSummary_(groupSheet, context, availableCoolOrder, unresolved);
  movePendingToManualAssignment_(groupSheet, sameDaySheet, context, unresolved, cols, stats, now, placementSummary);
}

function buildSameDayPlacementSummary_(groupSheet, context, coolOrder, pending) {
  const coolSummaries = [];
  for (const coolNo of coolOrder) {
    const section = getCoolSection_(context, coolNo);
    const groups = getCoolGroupSummaries_(groupSheet, section);
    const existingVacancies = groups
      .filter(group => group.memberCount >= CONFIG.MEMBERS_PER_TEAM - 2)
      .filter(group => group.memberCount < CONFIG.MEMBERS_PER_TEAM)
      .reduce((sum, group) => sum + group.emptyRows.length, 0);
    const emptyGroups = groups.filter(group => group.memberCount === 0 && group.emptyRows.length >= 3).length;
    coolSummaries.push(`${coolLabel_(coolNo)}: 既存空き${existingVacancies}枠・空グループ${emptyGroups}`);
  }

  return `${coolSummaries.join(' / ')} / 未配置${pending.length}名`;
}

function movePendingToManualAssignment_(groupSheet, sameDaySheet, context, pending, cols, stats, now, placementSummary) {
  if (!pending.length) return;

  const section = getOrCreateManualAssignmentSection_(groupSheet, context);
  for (const member of pending) {
    const remainsInManual = member.sourceAssignment && member.sourceAssignment.type === 'manual';
    if (!remainsInManual) {
      removePendingSourceAssignment_(groupSheet, context, member);
      const target = appendToListSection_(groupSheet, section, member.id);
      context.index.set(member.id, {
        type: 'manual',
        label: CONFIG.LABELS.MANUAL,
        row: target.row,
        col: target.col
      });
    }

    const notePrefix = member.movedFromReapply ? '再度申請から外しました。' : '';
    const actionNote = remainsInManual
      ? '配置できる空きがないため、手動割り当て欄に残しました。'
      : '対象クールへ配置できないため、手動割り当て欄へ追加しました。';
    writeSameDayResult_(
      sameDaySheet,
      member.sheetRow,
      cols,
      '手動割り当て',
      CONFIG.LABELS.MANUAL,
      `${notePrefix}${actionNote}${placementSummary}`,
      now
    );
    stats.manual++;
  }
}

function getOrCreateManualAssignmentSection_(sheet, context) {
  const existing = context.sections.find(section => section.type === 'manual');
  if (existing) return existing;

  const startCol = sheet.getLastColumn() + 1;
  ensureSheetHasColumn_(sheet, startCol + 1);
  sheet.getRange(1, startCol, 1, 2)
    .setValues([[`【${CONFIG.LABELS.MANUAL}】`, '']])
    .setFontWeight('bold');
  sheet.getRange(2, startCol, 1, 2)
    .setValues([['学籍番号', '']])
    .setFontWeight('bold');
  sheet.setColumnWidth(startCol, 100);
  sheet.setColumnWidth(startCol + 1, 40);

  const section = {
    type: 'manual',
    label: CONFIG.LABELS.MANUAL,
    startCol,
    idCol: startCol,
    width: 2
  };
  context.sections.push(section);
  return section;
}

function placePendingIntoExistingCoolVacancies_(groupSheet, sameDaySheet, context, pending, cols, stats, now, coolNo) {
  const section = getCoolSection_(context, coolNo);
  if (!section) return;

  const groups = getCoolGroupSummaries_(groupSheet, section)
    .filter(g => g.memberCount >= CONFIG.MEMBERS_PER_TEAM - 2)
    .filter(g => g.memberCount < CONFIG.MEMBERS_PER_TEAM && g.emptyRows.length > 0)
    .sort((a, b) => b.memberCount - a.memberCount);

  for (const group of groups) {
    while (group.memberCount < CONFIG.MEMBERS_PER_TEAM && group.emptyRows.length > 0) {
      const members = takeCompatiblePending_(pending, coolNo, 1);
      if (!members.length) return;

      const row = group.emptyRows.shift();
      const rowsById = new Map([[members[0].id, row]]);
      removePendingSourceAssignment_(groupSheet, context, members[0]);
      groupSheet.getRange(row, section.idCol)
        .setValue("'" + members[0].id)
        .setBackground(CONFIG.SAME_DAY_SETTINGS.HIGHLIGHT_COLOR);
      group.memberCount++;

      writeSameDayCoolPlacementResults_(
        sameDaySheet,
        context,
        section,
        members,
        coolNo,
        group.groupNo,
        rowsById,
        cols,
        stats,
        now,
        '当日申請者をグループへ配置しました'
      );
    }
  }
}

function createSameDayThreePersonTeamsInEmptyGroups_(groupSheet, sameDaySheet, context, pending, cols, stats, now, coolNo) {
  const section = getCoolSection_(context, coolNo);
  if (!section) return;

  const emptyGroups = getEmptyCoolGroups_(groupSheet, section);
  for (const group of emptyGroups) {
    if (countCompatiblePending_(pending, coolNo) < 3) return;

    const members = takeCompatiblePending_(pending, coolNo, 3);
    const rowsById = placeMembersInCoolGroup_(groupSheet, context, section, group, members);
    writeSameDayCoolPlacementResults_(
      sameDaySheet,
      context,
      section,
      members,
      coolNo,
      group.groupNo,
      rowsById,
      cols,
      stats,
      now,
      '当日申請者をグループへ配置しました'
    );
  }
}

function getEffectiveSameDayCoolCandidates_(item) {
  return item.coolCandidates.length ? item.coolCandidates : buildSameDayCoolOrder_();
}

function countCompatiblePending_(pending, coolNo) {
  return pending.filter(item => getEffectiveSameDayCoolCandidates_(item).includes(coolNo)).length;
}

function takeCompatiblePending_(pending, coolNo, count) {
  const members = [];
  for (let i = 0; i < pending.length && members.length < count; i++) {
    if (!getEffectiveSameDayCoolCandidates_(pending[i]).includes(coolNo)) continue;
    members.push(pending[i]);
    pending.splice(i, 1);
    i--;
  }
  return members;
}

function placeMembersInCoolGroup_(sheet, context, section, group, members) {
  const rowsById = new Map();
  for (let i = 0; i < members.length; i++) {
    const row = group.emptyRows[i];
    const id = members[i].id;
    removePendingSourceAssignment_(sheet, context, members[i]);
    sheet.getRange(row, section.idCol)
      .setValue("'" + id)
      .setBackground(CONFIG.SAME_DAY_SETTINGS.HIGHLIGHT_COLOR);
    rowsById.set(id, row);
  }
  return rowsById;
}

function writeSameDayCoolPlacementResults_(sameDaySheet, context, section, members, coolNo, groupNo, rowsById, cols, stats, now, baseNote) {
  for (const member of members) {
    context.index.set(member.id, {
      type: 'cool',
      label: coolLabel_(coolNo),
      groupNo,
      row: rowsById.get(member.id),
      col: section.idCol
    });

    const notePrefix = member.movedFromReapply ? '再度申請から外して配置しました。' : '';
    const noteSuffix = member.coolCandidates.length
      ? ''
      : '希望内容を判定できなかったため、汎用参加希望として配置しました。';
    const note = `${notePrefix}${baseNote}。${noteSuffix}`;
    writeSameDayResult_(sameDaySheet, member.sheetRow, cols, '配置済み', `${coolLabel_(coolNo)} G${groupNo}`, note, now);
    stats.placed++;
  }
}

// 予備ロジック：当日申請者数から空グループとチーム人数をまとめて決める方式に使用する。
function chooseSameDayEmptyGroupTarget_(sheet, context, pending) {
  const coolOrder = buildSameDayCoolOrder_();

  for (const coolNo of coolOrder) {
    const section = getCoolSection_(context, coolNo);
    if (!section) continue;

    const compatibleCount = pending.filter(item => getEffectiveSameDayCoolCandidates_(item).includes(coolNo)).length;
    if (compatibleCount <= 0) continue;

    const emptyGroups = getEmptyCoolGroups_(sheet, section);
    const groupsNeeded = Math.max(emptyGroups.length, Math.ceil(compatibleCount / CONFIG.MEMBERS_PER_TEAM), 1);
    const sizes = chooseSameDayTeamSizes_(compatibleCount, groupsNeeded);
    if (!sizes.length) continue;

    const candidate = {
      coolNo,
      section,
      size: sizes[0],
      emptyGroupCount: emptyGroups.length,
      compatibleCount
    };

    return candidate;
  }

  return null;
}

function buildSameDayCoolOrder_() {
  const seen = new Set();
  const order = [];
  for (const n of CONFIG.SAME_DAY_SETTINGS.GENERIC_COOL_PRIORITY) {
    if (n >= 1 && n <= CONFIG.TOTAL_COOLS && !seen.has(n)) {
      seen.add(n);
      order.push(n);
    }
  }
  return order;
}

function isSameDayTargetCool_(coolNo) {
  return buildSameDayCoolOrder_().includes(coolNo);
}

function chooseSameDayTeamSizes_(count, maxGroups) {
  if (count <= 0) return [];

  const minGroups = Math.ceil(count / CONFIG.MEMBERS_PER_TEAM);

  // 3人チームを基準にし、余りが出たら先に作った3人チームへ1人ずつ足して4人にする。
  // 例: 6人 -> 3+3、7人 -> 4+3、8人 -> 4+4、10人 -> 4+3+3。
  for (let groups = minGroups; groups <= maxGroups; groups++) {
    if (count >= 3 * groups && count <= CONFIG.MEMBERS_PER_TEAM * groups) {
      const threeCount = CONFIG.MEMBERS_PER_TEAM * groups - count;
      const fourCount = groups - threeCount;
      return [
        ...Array(fourCount).fill(CONFIG.MEMBERS_PER_TEAM),
        ...Array(threeCount).fill(3)
      ];
    }
  }

  const groups = minGroups;
  if (groups > maxGroups) return [];

  const base = Math.floor(count / groups);
  let extra = count % groups;
  const sizes = [];
  for (let i = 0; i < groups; i++) {
    sizes.push(base + (extra > 0 ? 1 : 0));
    if (extra > 0) extra--;
  }
  return sizes.sort((a, b) => b - a);
}

function getEmptyCoolGroups_(sheet, section) {
  return getCoolGroupSummaries_(sheet, section)
    .filter(g => g.memberCount === 0 && g.emptyRows.length >= 3);
}

function placeSameDayTeamInEmptyGroup_(sheet, context, section, members) {
  const emptyGroups = getEmptyCoolGroups_(sheet, section)
    .filter(group => group.emptyRows.length >= members.length);
  if (!emptyGroups.length) return null;

  const group = emptyGroups[0];
  const rowsById = placeMembersInCoolGroup_(sheet, context, section, group, members);

  return { groupNo: group.groupNo, rowsById };
}

function removePendingMembers_(pending, members) {
  const ids = new Set(members.map(member => member.id));
  for (let i = pending.length - 1; i >= 0; i--) {
    if (ids.has(pending[i].id)) pending.splice(i, 1);
  }
}

function getCoolGroupSummaries_(sheet, section) {
  const lastRow = Math.max(sheet.getLastRow(), 3);
  const values = sheet.getRange(3, section.groupCol, lastRow - 2, 2).getValues();
  const groups = [];
  const byNo = new Map();

  for (let i = 0; i < values.length; i++) {
    const groupNo = String(values[i][0] || '').trim();
    if (!groupNo) continue;

    const row = i + 3;
    if (!byNo.has(groupNo)) {
      const group = {
        groupNo,
        memberCount: 0,
        emptyRows: []
      };
      byNo.set(groupNo, group);
      groups.push(group);
    }

    const group = byNo.get(groupNo);
    const id = normalizeStudentId_(values[i][1]);
    if (id) {
      group.memberCount++;
    } else {
      group.emptyRows.push(row);
    }
  }

  return groups;
}

function isSameDayBcPref_(pref) {
  const normalized = normalizePref_(pref);
  return normalized === normalizePref_(CONFIG.PREF_VALUE.BC) ||
    normalized === normalizePref_(CONFIG.LABELS.BC) ||
    normalized.indexOf('BC') >= 0 ||
    normalized.indexOf('ベーシック') >= 0;
}

function getSectionByTypeRequired_(context, type) {
  const section = context.sections.find(s => s.type === type);
  if (!section) throw new Error(`「${CONFIG.SHEETS.GROUP_CHECK}」に ${type} ブロックがありません。`);
  return section;
}

function getCoolSection_(context, coolNo) {
  return context.sections.find(s => s.type === 'cool' && s.coolNo === coolNo) || null;
}

function removeExistingAssignment_(sheet, assignment) {
  // 当日申請で付けた背景色も消し、移動元に黄色い空欄が残らないようにする。
  sheet.getRange(assignment.row, assignment.col)
    .clearContent()
    .setBackground(null);
}

function removePendingSourceAssignment_(sheet, context, member) {
  if (!member.sourceAssignment) return;
  removeExistingAssignment_(sheet, member.sourceAssignment);
  context.index.delete(member.id);
  member.sourceAssignment = null;
}

function appendToListSection_(sheet, section, id, note) {
  const targetRow = findFirstEmptyListRow_(sheet, section);
  ensureSheetHasRow_(sheet, targetRow);
  sheet.getRange(targetRow, section.idCol)
    .setValue("'" + id)
    .setBackground(CONFIG.SAME_DAY_SETTINGS.HIGHLIGHT_COLOR);
  if (section.noteCol) {
    sheet.getRange(targetRow, section.noteCol)
      .setValue(note || '')
      .setBackground(CONFIG.SAME_DAY_SETTINGS.HIGHLIGHT_COLOR);
  }
  return { row: targetRow, col: section.idCol };
}

function findFirstEmptyListRow_(sheet, section) {
  const lastRow = Math.max(sheet.getLastRow(), 3);
  const values = sheet.getRange(3, section.idCol, lastRow - 2, 1).getValues();
  for (let i = 0; i < values.length; i++) {
    if (!normalizeStudentId_(values[i][0])) return i + 3;
  }
  return lastRow + 1;
}

function placeInCoolVacancy_(sheet, section, id) {
  const groups = getCoolGroupSummaries_(sheet, section)
    .sort((a, b) => b.memberCount - a.memberCount);
  for (const group of groups) {
    if (group.memberCount < CONFIG.MEMBERS_PER_TEAM - 2) continue;
    if (!group.emptyRows.length) continue;

    const row = group.emptyRows[0];
    sheet.getRange(row, section.idCol)
      .setValue("'" + id)
      .setBackground(CONFIG.SAME_DAY_SETTINGS.HIGHLIGHT_COLOR);
    return { row, col: section.idCol, groupNo: group.groupNo };
  }
  return null;
}

function ensureSheetHasRow_(sheet, row) {
  const maxRows = sheet.getMaxRows();
  if (row > maxRows) sheet.insertRowsAfter(maxRows, row - maxRows);
}

function ensureSheetHasColumn_(sheet, col) {
  const maxCols = sheet.getMaxColumns();
  if (col > maxCols) sheet.insertColumnsAfter(maxCols, col - maxCols);
}

function formatExistingLocation_(assignment) {
  if (assignment.type === 'cool') return `${assignment.label} G${assignment.groupNo}`;
  return assignment.label;
}

function formatDuplicateLocations_(context, id) {
  return (context.duplicates.get(id) || []).map(formatExistingLocation_).join(', ');
}


/*************************************************
 *  共通ユーティリティ：値・行操作
 *************************************************/
function appendRow_(sheet, row) {
  sheet.appendRow(row);
}

function findRowByValue_(sheet, colIndex1Based, value) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { row: -1 };

  const values = sheet.getRange(2, colIndex1Based, lastRow - 1, 1)
    .getValues().flat().map(v => String(v).trim());
  const idx = values.indexOf(String(value).trim());
  return { row: idx >= 0 ? idx + 2 : -1 };
}

function getNamedValuesSafe_(e) {
  return e && e.namedValues ? e.namedValues : {};
}

function firstValue_(arr) {
  if (!arr) return '';
  if (Array.isArray(arr)) return arr.length ? arr[0] : '';
  return arr;
}

function normalizeStudentId_(v) {
  return String(v || '').trim().toLowerCase();
}

function normalizePref_(s) {
  return String(s || '').trim().replace(/\s|　/g, '');
}

function coolLabel_(n) {
  return `第${n}クール`;
}

function buildStudentMail_(id) {
  return `${id}${CONFIG.MAIL_DOMAIN}`;
}

function generatePassword_() {
  const max = Math.pow(10, CONFIG.PASSWORD_LENGTH) - 1;
  const n = Math.floor(Math.random() * (max + 1));
  return String(n).padStart(CONFIG.PASSWORD_LENGTH, '0');
}

function pasteColumn_(sheet, startRow, col, arr) {
  if (!arr || !arr.length) return;
  // 文字列（学籍番号など）の先頭0を維持するため "'" を付加してセット
  sheet.getRange(startRow, col, arr.length, 1).setValues(arr.map(v => ["'" + v]));
}

function toTime_(v) {
  if (v instanceof Date) return v.getTime();
  const d = new Date(v);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}

function shuffleCopy_(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function chooseTeamsCount_(N, maxTeams) {
  const lower = Math.ceil(N / 4);
  const upper = Math.min(maxTeams, Math.floor(N / 3));
  if (lower > upper) return 0;
  return lower;
}

function chooseTeamsCountWithSameDayReserve_(N, maxTeams) {
  if (N <= 0) return 0;

  const minTeams = Math.ceil(N / CONFIG.MEMBERS_PER_TEAM);
  const maxValidTeams = Math.min(maxTeams, Math.floor(N / 3));
  if (minTeams > maxValidTeams) return 0;

  const targetThreePersonTeams = CONFIG.SAME_DAY_SETTINGS.RESERVED_THREE_PERSON_TEAMS;
  const reserveTeams = Math.ceil((N + targetThreePersonTeams) / CONFIG.MEMBERS_PER_TEAM);
  const teams = Math.min(Math.max(minTeams, reserveTeams), maxValidTeams);
  const emptySlots = CONFIG.MEMBERS_PER_TEAM * teams - N;

  if (emptySlots < targetThreePersonTeams) {
    Logger.log(`当日追加用の3人チームは ${emptySlots} チームです（目標 ${targetThreePersonTeams} チーム）。`);
  }
  return teams;
}

function splitTeams34Strict_(ids, T, labelForUi) {
  const N = ids.length;
  if (T <= 0) return [];
  if (N < 3 * T || N > 4 * T) {
    throw new Error(`${labelForUi}: N=${N} は 3T..4T を満たさないため分割不可`);
  }

  const a = 4 * T - N;
  const fourCnt = T - a;
  const layout = [...Array(fourCnt).fill(4), ...Array(a).fill(3)];

  let idx = 0;
  const groups = [];
  for (let g = 0; g < T; g++) {
    const size = layout[g];
    const members = ids.slice(idx, idx + size);
    idx += size;
    groups.push({ no: g + 1, members });
  }
  return groups;
}

function flattenPairs_(groups, offset) {
  const pairs = [];
  const MAX_SIZE = CONFIG.MEMBERS_PER_TEAM;
  for (const g of groups) {
    const dispNo = offset + g.no;
    for (const id of g.members) {
      pairs.push({ id, no: dispNo });
    }
    // 不足分を空のIDで埋める（グループ番号は保持）
    for (let i = g.members.length; i < MAX_SIZE; i++) {
      pairs.push({ id: '', no: dispNo });
    }
  }
  return pairs;
}

function pairsToRows_(pairs) {
  return pairs.map(p => [p.no, p.id, '']);
}

function listToRows_(ids) {
  return ids.map(id => [id, '']);
}

function writeBlockLayout_(sheet, blocks) {
  let col = 1;
  for (const b of blocks) {
    const width = b.head.length;
    sheet.getRange(1, col, 1, width)
      .setValues([[b.title, ...Array(width - 1).fill('')]])
      .setFontWeight('bold');
    sheet.getRange(2, col, 1, width)
      .setValues([b.head])
      .setFontWeight('bold');
    col += width;
  }

  const maxRows = Math.max(...blocks.map(b => b.rows.length), 0);
  if (maxRows > 0) {
    const rowData = [];
    for (let i = 0; i < maxRows; i++) {
      const row = [];
      for (const b of blocks) {
        const width = b.head.length;
        const r = b.rows[i] || Array(width).fill('');
        const copy = r.slice();
        if (copy.length < width) copy.push(...Array(width - copy.length).fill(''));
        if (copy.length > width) copy.length = width;
        row.push(...copy);
      }
      rowData.push(row);
    }
    const totalCols = blocks.reduce((s, b) => s + b.head.length, 0);
    sheet.getRange(3, 1, rowData.length, totalCols).setValues(rowData);
  }

  col = 1;
  for (const b of blocks) {
    for (const w of b.widths) {
      sheet.setColumnWidth(col, w);
      col++;
    }
  }
}

function copyRangeStylesAcrossSpreadsheets_(srcRange, destRange) {
  destRange.setBackgrounds(srcRange.getBackgrounds());
  destRange.setFontColors(srcRange.getFontColors());
  destRange.setFontWeights(srcRange.getFontWeights());
  destRange.setFontSizes(srcRange.getFontSizes());
  destRange.setHorizontalAlignments(srcRange.getHorizontalAlignments());
  destRange.setVerticalAlignments(srcRange.getVerticalAlignments());
  destRange.setNumberFormats(srcRange.getNumberFormats());
}

function clearFormResponsesBySheetName_(sheetName) {
  const ss = SpreadsheetApp.openById(CONFIG.ADMIN_SPREADSHEET_ID);
  const sh = ss.getSheetByName(sheetName);
  if (!sh) return;

  const lastRow = sh.getLastRow();
  if (lastRow > 1) sh.deleteRows(2, lastRow - 1);
  if (sh.getMaxRows() < 500) sh.insertRowsAfter(1, 500);
}


/*************************************************
 *  予約関連ユーティリティ
 *************************************************/
function storeTrigger_(triggerKey, timeKey, trig, date) {
  const prop = PropertiesService.getScriptProperties();
  prop.setProperty(triggerKey, trig.getUniqueId());
  prop.setProperty(timeKey, date.toISOString());
}

/**
 * 実行されたトリガーの「次回（7日後）」を自動予約するヘルパー
 *
 * @param {string} propKeyAt      - 業務プロパティの時刻キー
 * @param {function} scheduleFunc - 次回日時と共に呼び出す予約関数
 * @param {string} weeklyScheduleKey - CONFIG.WEEKLY_SCHEDULE のキー（フォールバック用）
 *
 * ⚠️ バグ修正：保存値 + 7日 が過去になった場合（スキップ・エラーなどで日付が古くなった場合）、
 * validateFutureDate_ でthrowされて全体がサイレント失敗するのを防ぐ。
 * nextAt が過去の場合は、CONFIG.WEEKLY_SCHEDULE[weeklyScheduleKey] から正しい「次の曜日・時刻」を再計算する。
 */
function autoScheduleNextWeek_(propKeyAt, scheduleFunc, weeklyScheduleKey) {
  const prop = PropertiesService.getScriptProperties();
  const currentAtStr = prop.getProperty(propKeyAt);
  if (!currentAtStr) return;

  const currentAt = new Date(currentAtStr);
  let nextAt = new Date(currentAt.getTime() + 7 * 24 * 60 * 60 * 1000);

  // nextAt が現在より過去の場合はフォールバック：CONFIG から正しい次回日時を再計算
  if (nextAt.getTime() <= Date.now()) {
    const key = weeklyScheduleKey || 'reset';
    Logger.log(`⚠️ autoScheduleNextWeek_[${key}]: 計算された次回日時 (${nextAt.toISOString()}) が過去のため、週次スケジュールから再計算します。`);
    const cfg = CONFIG.WEEKLY_SCHEDULE && CONFIG.WEEKLY_SCHEDULE[key];
    if (cfg && typeof cfg.day !== 'undefined') {
      nextAt = getNextWeekdayTimeJST_(cfg.day, cfg.hour, cfg.minute);
      Logger.log(`✅ フォールバック日時: ${nextAt.toISOString()}`);
    } else {
      Logger.log(`⚠️ CONFIG.WEEKLY_SCHEDULE.${key} が見つからないため次回予約をスキップします。`);
      return;
    }
  }

  scheduleFunc(nextAt);
}


function deleteTriggerByStoredId_(triggerKey) {
  const prop = PropertiesService.getScriptProperties();
  const id = prop.getProperty(triggerKey);
  if (!id) return;

  for (const t of ScriptApp.getProjectTriggers()) {
    if (t.getUniqueId && t.getUniqueId() === id) {
      ScriptApp.deleteTrigger(t);
    }
  }
  prop.deleteProperty(triggerKey);
}

function deleteProperty_(key) {
  PropertiesService.getScriptProperties().deleteProperty(key);
}

function validateFutureDate_(date, label) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error(`${label}が不正です。`);
  }
  if (date.getTime() <= Date.now()) {
    throw new Error(`${label}は未来を指定してください。`);
  }
}


/*************************************************
 *  JST
 *************************************************/
function getNextWeekdayTimeJST_(weekday, hour, minute) {
  const now = new Date();
  const jstNowStr = Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss');
  const jstNow = new Date(jstNowStr);

  const result = new Date(jstNow);
  let diff = (weekday - jstNow.getDay() + 7) % 7;

  if (diff === 0 && (jstNow.getHours() > hour || (jstNow.getHours() === hour && jstNow.getMinutes() >= minute))) {
    diff = 7;
  }

  result.setDate(jstNow.getDate() + diff);
  result.setHours(hour, minute, 0, 0);
  return result;
}

function formatJST_(date) {
  return Utilities.formatDate(date, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss');
}

function parseJST_YYYYMMDD_HHMM_(txt) {
  const m = String(txt).match(/^(\d{4})\/(\d{2})\/(\d{2})[ T](\d{2}):(\d{2})$/);
  if (!m) throw new Error('日時形式は YYYY/MM/DD HH:mm で入力してください。');
  const [_, y, mo, d, h, mi] = m.map(Number);
  const s = Utilities.formatDate(new Date(y, mo - 1, d, h, mi, 0), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss');
  return new Date(s);
}
