---
title: "Next.jsでブログをリニューアルしました！"
type: "tech"
category: []
publish: true
---


```go
const s string ="constant"

func main () {
  fmt.Println('Hello World')
}
```

SSGだと、マークダウンを更新する度にデプロイが必要なのでISRへ変更。マークダウンはDynamoDBに突っ込んでAPI Gatewayで配信、ISR時にAPIを叩くようにした。
```typescript
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDOPOINT}/article/${params.articleId}`,
  );

  const article = (await res.json()) as ArticleType;
  ...
```

## ホスティング
最初はS3+CloudFront構成。以下の点でVercelに変更。
* S3に`next build` `next export` した資材をアップロードする必要あり(自前でCIを書くのが面倒)
* S3に静的ホスティングするにはNext.jsと相性の悪い点がいくつかあり
  * 参考記事
    * [Next.jsでSSGした静的サイトを（CSR後リロード時404問題を最小コストで解決しながら）S3でホスティングする](https://qiita.com/ryokkkke/items/1478a022b220bf6e61ff)

## ドメイン
最初はRoute53を利用。上記の理由でホスティング先をVercelに変えてから、下記の点で嵌った。

* 当初サブドメインなしの`hozi.dev`で配信検討。サブドメインなしの場合、ANAMEかネームサーバーを変更する必要あり。
  * 調べた感じANAME対応のドメインレジストラは少なそう..?
  * 既にAPIGatewayを`api.hozi.dev`で配信していたため、ネームサーバーを変えるのはちょっと面倒で、`blog.hozi.dev`でCNAMEをRoute53に設定することで妥協

## Vercel
* リポジトリをGitHub Teamに作っていたため、連携する際にVercelでチームを作る必要あり。Trial期間後、20$/mo [pricing](https://vercel.com/pricing)
  * 個人のリポジトリなら無料なので、リポジトリを個人アカウント配下へ移行
* `blog.hozi.dev`はVercel経由でドメイン取得(証明書も自動で作られる)。ここら辺はサクサク設定できた
  * 前述の通りRoute53側にのCNAMEに`cname.vercel-dns.com`設定する必要あり

## マークダウンからHTMLへの変換
多いに`zenn-editor`のリポジトリを参考にした。知見の宝庫でした。
[zenn-editor](https://github.com/zenn-dev/zenn-editor)

## デザイン
一応Figmaでざっくりデザインしてたりします(しててこのレベル感...)。Figmaはいいツールです。アニメーションとか使いこなしたい..

# 最後に
よくある静的サイトジェネレータでテーマ突っ込んで終わりのブログだと、愛着が沸かなかった。自分でデザインもコードも書いているので痒いところに手が届くのも気に入っています。大事に育てていきたいです！

普段サーバサイドしかやらないので、良い素振りになりました！以上！
