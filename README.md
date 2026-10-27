# groupwork-gas

授業のグループワークを運営するための Google Apps Script（GAS）をまとめたリポジトリです。用途ごとにフォルダを分けています。フォルダごとに別の Apps Script プロジェクトへ貼り付けて使い、フォルダ間でコードは共有しません。

| フォルダ | 内容 | 貼り付け先 |
|---|---|---|
| [group-assign/](group-assign/README.md) | クールの申請受付、本人確認、定員管理、班分け、公開を自動化する | 管理用スプレッドシートの Apps Script（セットアップ用は単独の Apps Script） |
| [slides-timetable/](slides-timetable/README.md) | グループワーク当日に投影するスライドの時間割表に、各クールの時刻を書き込む | 時間割の Google スライドの Apps Script |

毎週の運用手順は、[group-assign の運用ガイド](group-assign/docs/usage.md)にあります。

## サンプルと説明資料

[Google ドライブの共有フォルダ](https://drive.google.com/drive/folders/1HNb5SVgiMj7ytrR_FyToBHNUVFqfU6P-?usp=sharing)に、次のものを置いています。

- GAS を動かしたときにできるスプレッドシートとフォーム。セットアップの前に、見た目を確認できます。
- 仕組みを説明するスライド。
