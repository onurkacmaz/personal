---
title: Tek kontrat, beş SDK
description: Feature flag platformu Togul'u büyük ölçüde tek başıma geliştirirken öğrendiklerim ve sıkıcı kısımların neden ürünün kendisi olduğu.
tags: [Go, Fiber, OpenAPI, Kubernetes]
lang: tr
---

*This post is also available [in English](/blog/one-contract-five-sdks/).*

[Togul](https://togul.io), yan tarafta geliştirdiğim bir feature flag ve remote
config platformu; LaunchDarkly ve Unleash'e alternatif olarak. Hepsini ben
yazıyorum: API, dashboard, SDK'lar, altyapı. Bu ya kötü bir fikir ya da bir
ürünün karmaşıklığı gerçekte nereye harcadığını öğrenmenin çok iyi bir yolu;
bir süre sonra birincisi olduğunu düşünmeyi bıraktım.

![Togul dashboard'u](/img/togul-2.jpg)

İlginç olan, işin nereye gittiği. Bir flag servisi kulağa güzel arayüzü olan
bir anahtar-değer deposu gibi geliyor. Emeğin neredeyse hiçbiri orada değildi.

## Evaluation engine saf, ve mesele tam olarak bu

API, Fiber üzerinde Go. Bir flag'in verilen bir bağlamda hangi değere
karşılık geldiğine karar veren parça ise **saf bir fonksiyon**. Veritabanı
bağlantısı yok, saat yok, HTTP isteği yok. Kurallar ve bağlam girer, değer
çıkar.

Bu estetik bir tercih değildi. Bir flag platformunun yanlış yapamayacağı tek
bir işi var: aynı flag hakkında aynı soruyu soran iki şey aynı cevabı almalı.
Dashboard bir evaluation'ın önizlemesini gösteriyor, API onu servis ediyor ve
her SDK kuralların yerel bir kopyasını tutuyor. Bunlardan biri diğerinden
ayrılırsa, birisi tekrar üretemediği bir hatayı prod'a çıkarır ve kendi
kodundan önce benim servisimi suçlar — haklı olarak.

Engine'i saf tutmak, hiçbir şeyi ayağa kaldırmadan enine boyuna test
edilebilmesi ve her çağırana olduğu gibi verilebilmesi demek.

## Bir flag'i çevirmek deploy gerektirmemeli

Bir flag servisinin yapamayacağı diğer şey de etkisinin geç görünmesi. Bir
şeyi kapatmak deploy istiyorsa, hatta bir cache TTL'i kadar bile beklemek
gerekiyorsa, kimse onu asıl önemli olan anda kullanmaya güvenmez — yani
prod'un alev aldığı anda.

SDK'lar API'ye açık bir SSE bağlantısı tutuyor. Bir flag'i çevirmek bağlı olan
herkese cache invalidation'ı dağıtıyor ve değişiklik çalışan süreçlere yeniden
başlatma, deploy ya da poll döngüsü olmadan ulaşıyor. Streaming aynı zamanda
sık yürünen yolun bedava olması demek: evaluation her istekte bir ağ çağrısı
değil, yerel bir arama.

## Beş SDK, tek OpenAPI kontratı

Togul'un Go, JavaScript/Next.js, PHP, Laravel ve Ruby için resmî SDK'ları var.
Beş dil, her birini elle ve API'nin nasıl göründüğüne dair kendi kanaatiyle
yazmanın birbirlerinden kopmalarını garanti edeceği kadar çok.

O yüzden önce kontrat geldi. Tek bir OpenAPI dokümanı tek doğru kaynak ve her
SDK ona göre üretiliyor. Bir alan eklemek, beş SDK'nın devraldığı tek bir
değişiklik oluyor; yapmayı hatırlamam gereken beş değişiklik değil. Togul'un
ürün olarak değerinin yarısı PHP'sinin Go'suyla aynı davranması ve bunun tek
sebebi ikisinden hiçbirinin tanım olmaması.

Aynı içgüdü kenardaki parçaları da doğurdu: flag'lerin repodaki her şeyle
birlikte kod olarak yönetilebilmesi için bir **Terraform provider** ve
scripting ile CI/CD için bir **CLI**. Kimse bir flag servisini Terraform
provider'ı için seçmez. Ama bunu kullanmasını istediğim ekipler prod'u
değiştirmek için dashboard tıklamak istemeyen ekipler ve onlar için bu, bir
araç ile bir oyuncak arasındaki fark.

![Togul'un açılış sayfası](/img/togul-1.jpg)

## Kimsenin landing page'e koymadığı kısımlar

Multi-tenancy, audit logging, Stripe ve LemonSqueezy üzerinden faturalama.
Kubernetes üzerinde PostgreSQL, Redis ve MongoDB ile çalışıyor; altyapı kendi
reposunda, kendi pipeline'ıyla duruyor, yani cluster'daki bir değişiklik de
diğerleri gibi gözden geçirilen bir değişiklik.

Takvimdeki zamanın çoğu bu listeye gitti ve hiçbiri kimsenin istediği bir
özellik değil. Aynı zamanda demo ettiğim bir şey ile bir şirketin bağımlı
olmasına razı olacağım bir şey arasındaki fark da bu. Audit logging, soru
*bunu gece ikide kim kapattı* olana kadar heyecan verici değildir;
multi-tenancy de yanlış yapmak bir müşterinin diğerinin flag'lerini görmesi
anlamına gelene kadar.

## Başlangıçtaki kendime ne söylerdim

Doğru olmak zorunda olan şeyi saf bir fonksiyon olarak yaz, kontratı da
istemcilerden önce yaz. İkisi de ilk gün daha pahalı ve ikisi de o günden
sonra karar olmaktan çıkıyor — yan projenin önünde tam zamanlı bir iş varken
ayakta kalmasının bütün sebebi de bu.

Togul: [togul.io](https://togul.io).
