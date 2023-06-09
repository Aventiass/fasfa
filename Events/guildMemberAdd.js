const { Ramalcim, Penalties, Inviter, Users, coin } = require('../../../Helpers/Schemas')
const moment = require("moment"); moment.locale("tr")
class GuildMemberAdd {
    Event = "guildMemberAdd"
    async run(member) {
        if (member.user.bot) return;
        const kurulus = new Date().getTime() - member.user.createdAt.getTime();
        let memberDay = moment(member.user.createdAt).format("DD"); let memberDate = moment(member.user.createdAt).format("YYYY HH:mm:ss"); let memberMonth = moment(member.user.createdAt).format("MM").replace("01", "Ocak").replace("02", "Şubat").replace("03", "Mart").replace("04", "Nisan").replace("05", "Mayıs").replace("06", "Haziran").replace("07", "Temmuz").replace("08", "Ağustos").replace("09", "Eylül").replace("10", "Ekim").replace("11", "Kasım").replace("12", "Aralık"); let memberCount = member.guild.members.cache.size.toString().replace(/ /g, "    ")
        const ramal = await Ramalcim.findOne({ guildID: member.guild.id })
        const aktifCezalar = await Penalties.find({ guildID: member.guild.id, Ceza: "JAIL", Aktif: true });
        if (member.guild.id === ramal.guildID) try {
            if (aktifCezalar.some(data => data.userID.includes(member.id))) {
                await member.setRoles(ramal.jailedRole)
                await client.channels.cache.get(ramal.jailLog).send({ embeds: [new Discord.MessageEmbed().setTitle('Cezalı').setColor("RANDOM").setDescription(`<@!${member.id}> isimli kullanıcıya, sunucudan cezalı iken çıktığı için <@&${ramal.jailedRole}> rolünü verdim ${emojis.onay}`).setTimestamp()] });
            } else if (ramal.bannedTag === true && ramal.bannedTags.some(tag => member.user.username.includes(tag))) {
                await member.setRoles(ramal.bannedTagRole).catch(e => console.log("Etkinlik : Guild Member Add - Hata : Yasaklı tagla sunucuya giren kişinin rolünü düzenleyemedim!"));
                await member.setNickname(`${ramal.isimsemboliki} Yasaklı Tag!`).catch(e => console.log("Etkinlik : Guild Member Add - Hata: Yasaklı tagla giren kişinin ismini düzenleyemedim!"));
                await client.channels.cache.get(ramal.jaillog).send({ embeds: [new Discord.MessageEmbed().setTitle('Yasak Tag').setColor("RANDOM").setDescription(`<@!${member.id}> isimli kullanıcıya, sunucumuza yasaklı bir tag ile girdiği için <@&${ramal.bannedTagRole}> rolünü verdim ${emojis.onay}`).setTimestamp().setFooter(`Developed By Ramal.`)] });
            } else if (ramal.newAccount === true && kurulus < config.userTime) {
                await member.setRoles(ramal.newAccountRole).catch(e => console.log("Etkinlik : Guild Member Add - Hata : Yeni hesabı olan kişiye rol veremedim!"));
                await member.setNickname(`${ramal.isimsemboliki} Şüpheli!`).catch(e => console.log("Etkinlik : Guild Member Add - Hata : Yeni hesabı olan kişinin ismini değiştiremedim!"))
                await client.channels.cache.get(ramal.denetimLog).send({ embeds: [new Discord.MessageEmbed().setTitle('Yeni Hesap').setColor("RANDOM").setTimestamp().setDescription(`<@${member.id}> İsimli kullanıcıya discorda yeni kayıt olduğu için <@&${ramal.newAccountRole}> rolünü verdim.\n${emojis.nokta}\`Hesabın Açılış Süresi:\` **${memberDay} ${memberMonth} ${memberDate}**`).setFooter(`Developed By Ramal.`)] })
            } else {
                if (ramal.unregisterRole) await member.roles.add(ramal.unregisterRole)
                if (ramal.etkinlikRole) await member.roles.add(ramal.etkinlikRole)
                if (ramal.cekilisRole) await member.roles.add(ramal.cekilisRole)
                const setNickname = `${ramal.isimsemboliki} İsim | Yaş`;
                if (member.manageable) member.setNickname(`${setNickname}`)
                const kontrol = new Date().getTime() - member.user.createdAt.getTime() < config.userTime ? `Şüpheli ${emojis.iptal}` : `**Hesap Durumu:** Güvenli ${emojis.onay}`
                if (ramal.welcomeChannel) client.channels.cache.get(ramal.welcomeChannel).send(`Merhaba **${member}** **${member.guild.name}** Sunucumuza Hoş Geldin!🎉🎉\n\nHesabın **${memberDay} ${memberMonth} ${memberDate}** tarihinde oluşturulmuş!\n\nSeninle birlikte **${memberCount}** kişi olduk. Sol taraftaki \`Confirmed\` odalarından birine kaydını yaptırabilirsin!\n\n\`\`\`Sunucumuza kayıt olduğunda kurallar kanalına göz atmayı unutmayınız. Kayıt olduktan sonra kuralları okuduğunuzu 
kabul edeceğiz ve içeride yapılacak cezalandırma işlemlerini bunu göz önünde bulundurarak yapacağız.\`\`\``)
                const channel = client.channels.cache.get(ramal.inviteLog);
                if (!channel) return;
                let entry = await member.guild.fetchAuditLogs({ type: 'BOT_ADD' }).then(audit => audit.entries.first());
                if (member.user.bot && entry) return channel.send({ content: `:tada: ${member} sunucumuza katıldı! Davet eden: **${entry.executor.tag}**` })
                const guildInvites = client.invites.get(member.guild.id) || new Discord.Collection()
                const invites = await member.guild.invites.fetch();
                const invite = invites.find((inv) => guildInvites.has(inv.code) && inv.uses > guildInvites.get(inv.code).uses) || guildInvites.find((x) => !invites.has(x.code)) || member.guild.vanityURLCode;
                const cacheInvites = new Discord.Collection();
                invites.map((inv) => { cacheInvites.set(inv.code, { code: inv.code, uses: inv.uses, inviter: inv.inviter }); });
                client.invites.set(member.guild.id, cacheInvites);
                if (invite === null) {
                    channel.send({ content: `:tada: ${member} sunucumuza katıldı! Davet eden: **Davetçi bulunamadı**` })
                } else if (invite === undefined) {
                    channel.send({ content: `:tada: ${member} sunucumuza katıldı! Davet eden: **Davetçi bulunamadı**` })
                } else if (!invite) {
                    channel.send({ content: `:tada: ${member} sunucumuza katıldı! Davet eden: **Davetçi bulunamadı**` })
                } else if (invite === member.guild.vanityURLCode) {
                    await Users.findOneAndUpdate({ userID: member.user.id }, { $set: { Inviter: { inviter: member.guild.id, date: Date.now() } } }, { upsert: true });
                    await Inviter.findOneAndUpdate({ guildID: member.guild.id, userID: member.guild.id }, { $inc: { total: 1 } }, { upsert: true });
                    const inviterData = await Inviter.findOne({ guildID: member.guild.id, userID: member.guild.id });
                    const total = inviterData ? inviterData.total : 0;
                    return channel.send({ content: `:tada: ${member} sunucumuza katıldı! Davet eden: \`Sunucu Özel URL\` (**${total}** davet)` });
                } else {
                    await Users.findOneAndUpdate({ userID: member.user.id }, { $set: { Inviter: { inviter: invite.inviter.id, date: Date.now() } } }, { upsert: true });
                    if (Date.now() - member.user.createdTimestamp <= config.userTime) {
                        await Inviter.findOneAndUpdate({ guildID: member.guild.id, userID: invite.inviter.id }, { $inc: { fake: 1, regular: 1 } }, { upsert: true });
                        const inviterData = await Inviter.findOne({ guildID: member.guild.id, userID: invite.inviter.id });
                        const total = inviterData ? inviterData.total : 0;
                        channel.send({ content: `:tada: ${member} sunucumuza katıldı! Davet eden: **${invite.inviter.tag}** (**${total}** davet)` });
                    } else {
                        await Inviter.findOneAndUpdate({ guildID: member.guild.id, userID: invite.inviter.id }, { $inc: { total: 1, regular: 1 } }, { upsert: true });
                        const inviterData = await Inviter.findOne({ guildID: member.guild.id, userID: invite.inviter.id });
                        const total = inviterData ? inviterData.total : 0;
                        if (ramal.coinSystem === true) await coin.findOneAndUpdate({ guildID: member.guild.id, userID: invite.inviter.id }, { $inc: { coin: config.inviteCoin } }, { upsert: true });
                        const inviterMember = member.guild.members.cache.get(invite.inviter.id);
                        if (inviterMember) await inviterMember.updateTask(member.guild.id, "invite", 1);
                        channel.send({ content: `:tada: ${member} sunucumuza katıldı! Davet eden: **${invite.inviter.tag}** (**${total}** davet)` });
                    }
                }
                if (ramal.tags.some(tag => member.user.username.includes(tag)) || member.user.discriminator == ramal.tags.filter(t => t.startsWith("#")) && !member.roles.cache.has(ramal.tagRol)) {
                    await member.roles.add(ramal.tagRol).catch(e => console.log("Etkinlik : User Update - Hata : Yeni gelen taglı üyeye taglı rolü veremedim!"));
                    await client.channels.cache.get(ramal.tagLog).send({ embeds: [new Discord.MessageEmbed().setColor("RANDOM").setTitle('Oto Tag').setDescription(`${member} adlı kullanıcıya adında tagımızı bulundurduğu için <@&${ramal.tagRol}> rolü verildi`).setTimestamp().setFooter(`Developed By Ramal..`)] });
                    if (member.manageable) await member.setNickname(member.displayName.replace(ramal.isimsembol, ramal.isimsemboliki ? ramal.isimsemboliki : ramal.isimsembol))
                }
            }
        } catch (error) {
            client.logger.error(`Etkinlik: ${module.exports.name} \nHata: ` + error + ``)
        }
    }
}

module.exports = GuildMemberAdd

