import { CommunityAccount } from '../types';

export const INITIAL_COMMUNITY_ACCOUNTS: CommunityAccount[] = [
  {
    id: 'comm-1',
    gameTitle: 'Grand Theft Auto V (GTA Online + $60M + Bunker)',
    platform: 'Epic Games',
    coverImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    username: 'epic_gta_vault01',
    password: 'GtaPassEasy2026!',
    instructions: 'Sign in on the Epic Games launcher. Please do not modify email or password so everyone can enjoy.',
    submittedBy: {
      userId: 'usr-disc-1',
      username: 'ShadowGamer_MA',
      avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=120&q=80',
      authProvider: 'discord',
      discordTag: '#4419'
    },
    submittedAt: '45 mins ago',
    views: 412,
    claims: 87,
    status: 'active',
    isVerified: true
  },
  {
    id: 'comm-2',
    gameTitle: 'Counter-Strike 2 Prime Status + Skins Pack',
    platform: 'Steam',
    coverImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
    username: 'cs2_prime_share_99',
    password: 'Cs2SteamPrime@2026',
    instructions: 'Steam Guard is disabled. Launch the game and enjoy Prime and Competitive servers.',
    submittedBy: {
      userId: 'usr-goog-1',
      username: 'Yassine_ProGamer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      authProvider: 'google'
    },
    submittedAt: '2 hours ago',
    views: 654,
    claims: 120,
    status: 'active',
    isVerified: true
  },
  {
    id: 'comm-3',
    gameTitle: 'Valorant All Agents Unlocked + Platinum 2',
    platform: 'Riot',
    coverImage: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80',
    username: 'riot_val_plat2',
    password: 'ValoPlatDrop2026#',
    instructions: 'Region EU (Frankfurt/London). All agents unlocked. Have fun gaming!',
    submittedBy: {
      userId: 'usr-disc-2',
      username: 'NeonStrike',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
      authProvider: 'discord',
      discordTag: '#1337'
    },
    submittedAt: '5 hours ago',
    views: 890,
    claims: 195,
    status: 'active',
    isVerified: true
  },
  {
    id: 'comm-4',
    gameTitle: 'Minecraft Java Edition (Original Premium Account)',
    platform: 'Minecraft',
    coverImage: 'https://images.unsplash.com/photo-1627856013091-fed6e4e30025?auto=format&fit=crop&w=800&q=80',
    username: 'mine_java_hero',
    password: 'CraftPremiumPass99',
    instructions: 'Works on the official Minecraft launcher, CurseForge, and Lunar Client.',
    submittedBy: {
      userId: 'usr-email-1',
      username: 'AmineCrafter',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      authProvider: 'email'
    },
    submittedAt: 'Yesterday',
    views: 1240,
    claims: 310,
    status: 'active',
    isVerified: true
  }
];
