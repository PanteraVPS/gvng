const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
    maintenance: {
        enabled: { type: Boolean, default: false },
        title: { type: String, default: "We'll be back soon" },
        message: { type: String, default: 'We are performing scheduled maintenance. Please check back shortly.' }
    },
    social: {
        instagram: { type: String, default: '#' },
        facebook: { type: String, default: '#' },
        twitter: { type: String, default: '#' }
    },
    anpc: {
        url: { type: String, default: 'https://anpc.ro' },
        icon: { type: String, default: '' },
        text: { type: String, default: 'ANPC' }
    },
    hero: {
        title: { type: String, default: 'GVNG 2025' },
        subtitle: { type: String, default: 'Discover premium quality clothing and accessories' }
    },
    singleton: {
        type: String,
        default: 'singleton',
        unique: true
    }
});

module.exports = mongoose.model('Settings', SettingsSchema);
