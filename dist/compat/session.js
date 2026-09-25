"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authOptions = exports.sessionScope = void 0;
exports.getServerSession = getServerSession;
const node_async_hooks_1 = require("node:async_hooks");
exports.sessionScope = new node_async_hooks_1.AsyncLocalStorage();
exports.authOptions = {};
async function getServerSession(_options) {
    const user = exports.sessionScope.getStore();
    return user ? { user } : null;
}
