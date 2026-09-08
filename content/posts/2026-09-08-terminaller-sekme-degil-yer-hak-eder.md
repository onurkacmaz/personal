---
title: Terminaller sekme değil, yer hak eder
description: Mesa'yı neden yazdım: kabukları bir sekme çubuğunun arkasına değil, sonsuz bir tuvale koyan bir macOS uygulaması.
tags: [Electron, React, macOS, node-pty]
lang: tr
---

*This post is also available [in English](/blog/terminals-deserve-a-place/).*

Kullandığım her terminal benden kafamda bir harita tutmamı istiyor. Sekme
çubuğunda `zsh`, `zsh`, `zsh`, `npm`, `zsh` yazıyor. Dördüncüsünün dev server,
ikincisinin de kapatmayı sürekli unuttuğum veritabanı olduğunu biliyorum ama
sadece yirmi dakika önce onları o sırayla açtığım için. Bir sekmenin yerini
değiştir ya da öğle yemeğinden dön, harita gitti.

Ben de [Mesa](https://github.com/onurkacmaz/mesa)'yı yazdım: aynı kabuklar,
sınırsız bir yüzeyde, her biri benim seçtiğim bir **yerde**.

![Mesa'nın tuvalinde üç terminal](/img/mesa-1.jpg)

## Konum hatırlanan bir şeydir

Bütün fikir şu: mekânsal hafıza bedava, liste hafızası değil. Servis sol altta
çünkü oraya koydum. Migration terminali sağ üstte, veritabanının yanında.
Onları bulmak için etiket okumuyorum, oldukları yere bakıyorum.

`⌘` ile scroll yakınlaştırıp uzaklaştırıyor, boşluk tuşu ve sürükleme
kaydırıyor, `⌘0` gerçek boyuta dönüyor, `⇧⌘0` bütün çalışma alanını ekrana
sığdırıyor. Uzaklaşınca yerleşimin kendisi indeks oluyor: neyin nerede
çalıştığını tek bakışta, hiçbir şeyde gezinmeden görüyorsun.

Tarayıcı panelleri de aynı tuvalde. Geliştirdiğim şey ile onu kontrol ettiğim
sayfa üst üste değil yan yana duruyor; alt-tab ile tam da ihtiyacım olan
logların üstünü kapatan bir tarayıcı penceresine geçmeyi bırakmamın sebebi
büyük ölçüde bu.

## Yarın geri dönmek

Bir tuvali düzenlemek, ancak düzen uygulamayı kapatınca hayatta kalıyorsa
değerli. Mesa; workflow'ları, panelleri, sekmeleri, tuvalin görünümünü, her
terminalin klasörünü ve her tarayıcının adresini bir `session.json` dosyasına
yazıyor ve açılışta geri okuyor.

Bilerek numara yapmadığı bir şey var: pty uygulamayla birlikte ölür. Geri
yüklenen terminal, **bırakıldığı klasörde duran yepyeni bir kabuk**. Yerleşim
geri geliyor, çalışan süreçler gelmiyor. Bunu gizleyip sahte bir geri yükleme
sunmaktansa açıkça söylemeyi tercih ederim; yoksa biri sunucusunun hâlâ ayakta
olduğunu sanır.

Uygulamanın yalnızca bir kez sorması gereken cevaplar — tanıtım kartlarını
okudun mu, `⌘E` klasörleri hangi editörde açsın — ayrı bir `flags.json`
dosyasında duruyor. Ayrıştırılamayan bir oturum dosyası üzerine yazılmak yerine
kenara alınıyor; iki dosya ayrı olduğu için de bozulmuş bir yerleşimi kurtarmak
daha önce verdiğin bir cevaba asla mal olmuyor.

## Testler nerede

Electron, React renderer, kabukları `node-pty` sürüyor, xterm.js çiziyor.
React'in ötesinde bir framework yok.

Yapısal olarak önemsediğim kısım üç dosyanın saf olması:

```
src/session.mjs   oturum dosyası nedir, ne zaman güvenilir
src/flags.mjs     uygulama senin hakkında neyi hatırlar, işin hakkında değil
src/editors.mjs   kurulu uygulamalardan hangisi editördür, hangisini seçtin
```

React yok, dosya sistemi yok. `electron/main.js` diski görebiliyor ve başka bir
şeyi göremiyor: ham metni ve ham dosya adlarını devrediyor, bunların ne
*anlama* geldiğine o üç modül karar veriyor. Bu ayrım mimari şovu değil —
kalıcılığın açılışı mahvedebilecek kısmı, doğrudan birim testi yazılan kısım
oluyor; `npm test` de önünde build adımı olmadan `node:test` üzerinde çalışıyor.

`⌘E` aynı içgüdünün devamı. Mesa editör gömmüyor; seçili terminalin güncel
klasörünü zaten kurulu olan editöre devrediyor ve cevabını hatırlıyor.
Değiştirmek için `⇧⌘E` ya da başlık çubuğuna sağ tık.

## Ne değil

Açıkça söylemeye değer, çünkü kısa bir liste:

- **Sadece Apple Silicon üzerinde macOS.** Repoda Windows ve Linux kodu var
  ama hiçbiri derlenmiyor ya da test edilmiyor; olduğu gibi çalışması
  beklenmemeli.
- **DMG imzasız.** macOS ilk açılışta reddedecek — sağ tık → Aç → Aç, bir
  kereye mahsus.
- **"Bir şey mi çalışıyor?" kontrolü zsh istiyor.** `⌘W`'nin çalışan bir
  komutu öldürmeden önce sorması bir zsh prompt hook'una dayanıyor. bash ya da
  fish altında paneller sormadan kapanır.
- **Agent orkestrasyonu yok, worktree yönetimi yok, görev panosu yok.** Mesa
  kabuk açar ve onları bir yere koyar. Hepsi bu.

Sonuncusu kendime karşı savunmak zorunda kaldığım madde. Her hafta tuvale
yakışacak bir özellik çıkıyor. Ama onu hâlâ kullanıyor olmamın sebebi tek bir
iş yapması; bir saniyede açılan bir terminal, benim için her şeyi yapabilen bir
terminalden daha değerli.

MIT lisanslı, `.dmg` dosyası
[Releases](https://github.com/onurkacmaz/mesa/releases) sayfasında. Issue ve
pull request'lere açığım.
