/**
 * Euphy-Bot - Plugin Tester / Evaluator (Super Bypass Version) 🎀
 * Fitur: Global Scope Injector & Anti Undefined Quoted
 */

const { exec } = require('child_process');
const util = require('util');

module.exports = {
    command: ['eval'],
    category: 'owner',
    noPrefix: true, 
    owner: true,    
    call: async (conn, m, { text, args, usedPrefix, command }) => {
        if (!text) return m.reply(`> reply chat atau kode js mu!`);

        global.evalCtx = {
            conn: conn,
            m: m,
            q: m.quoted || null,
            msg: m.quoted ? (m.quoted.msg || m.quoted) : (m.msg || m)
        };

        let evalCmd;
        try {
            evalCmd = await eval(`(async () => { 
                // Buat alias lokal di dalam eval agar ketikan kamu tetep pendek
                const conn = global.evalCtx.conn;
                const m = global.evalCtx.m;
                const q = global.evalCtx.q;
                const msg = global.evalCtx.msg;
                
                return ${text}; 
            })()`);
        } catch (e) {
            evalCmd = e;
        }

        delete global.evalCtx;

        return m.reply(util.format(evalCmd));
    }
};
