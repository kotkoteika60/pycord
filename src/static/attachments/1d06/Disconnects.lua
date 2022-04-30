table.insert(Dummy_scripts, {label = ">Disconnects 0.0.4", cmd = "dummyMenu_load Dummy_disco", hide = false})
--gameResult результат боя
--	victory				Победа
--	defeat				Поражение
--	freePlayFinish		Бой закончен
--	unfinished			Бой закончен
--	disband				Игра прервана
--	instnaceTransfer	Поражение
--	explorationFinish	Бой закончен

Dummy_disco = {
	backBtn,
	{label = "\tОбычные сообщения", hide = false},
	{label = "NETWORK_FAIL", scriptrun	= "MpClientDisconnect(0)", hide = false}, --
	{label = "TOO_MANY_PLAYERS", scriptrun	= "MpClientDisconnect(1)", hide = false}, --
	{label = "BAD_GAME_VERSION", scriptrun	= "MpClientDisconnect(3)", hide = false}, --
	{label = "BAD_GAMEDATA_VERSION", scriptrun	= "MpClientDisconnect(4)", hide = false}, --
	{label = "BAD_LEVEL", scriptrun	= "MpClientDisconnect(5)", hide = false}, --
	{label = "KICK", scriptrun	= "MpClientDisconnect(6)", hide = false}, --
	{label = "QUIT", scriptrun	= "MpClientDisconnect(7)", hide = false}, --
	{label = "CLIENT_QUIT", scriptrun	= "MpClientDisconnect(8)", hide = false}, --
	{label = "GAMEPLAY_DOES_NOT_ACCEPT", scriptrun	= "MpClientDisconnect(9)", hide = false}, --
	{label = "GAME_FINISHED", scriptrun	= "MpClientDisconnect(10)", hide = false}, --
	{label = "CLIENT_COULD_NOT_CONNECT", scriptrun	= "MpClientDisconnect(11)", hide = false}, --
	{label = "MASTER_SERVER_CONNECTION_FAILED", scriptrun	= "MpClientDisconnect(12)", hide = false}, --
	{label = "FAIL_LOAD_USER", scriptrun	= "MpClientDisconnect(13)", hide = false}, --
	{label = "BAD_AUTH_TOKEN", scriptrun	= "MpClientDisconnect(14)", hide = false}, --
	{label = "XBOX_SESSION_ERROR", scriptrun	= "MpClientDisconnect(15)", hide = false}, --
	{label = "KICK_AFK", scriptrun	= "MpClientDisconnect(16)", hide = false}, --
	{label = "KICK_INVALID_CAR", scriptrun	= "MpClientDisconnect(17)", hide = false}, --
	{label = "KICK_INVENTORY_FULL", scriptrun	= "MpClientDisconnect(18)", hide = false}, --
	{label = "KICK_INSUFFICIENT_STAMINA", scriptrun	= "MpClientDisconnect(19)", hide = false}, --
	{label = "KICK_CAR_PART_EXPIRED", scriptrun	= "MpClientDisconnect(20)", hide = false}, --
	{label = "PARTY_QUIT", scriptrun	= "MpClientDisconnect(21)", hide = false}, --
	{label = "CUSTOM_GAME_QUIT", scriptrun	= "MpClientDisconnect(24)", hide = false}, --
	{label = "MISSION_NOT_SCHEDULED", scriptrun	= "MpClientDisconnect(26)", hide = false}, --
	{label = "CAPTCHA_REQUIRED", scriptrun	= "MpClientDisconnect(27)", hide = false}, --
	{label = "KICK_NO_PARTICIPATION_IN_GAME", scriptrun	= "MpClientDisconnect(28)", hide = false}, --
	{label = "KICK_EXCESSIVE_BOT", scriptrun	= "MpClientDisconnect(29)", hide = false}, --(сус немнога)
	{label = "KICK_TIMEOUT", scriptrun	= "MpClientDisconnect(31)", hide = false}, --(сус немнога)
	{label = "---", hide = false},
	{label = "\tВ матч мейкинг", hide = false},
	{label = "RETURN_TO_MATCHMACKER", scriptrun	= "MpClientDisconnect(22)", hide = false}, --(перекидывает на поиск боя)
	{label = "MANUALLY_RETURN_TO_MATCHMACKER", scriptrun	= "MpClientDisconnect(23)", hide = false}, --(перекидывает на поиск боя)
	{label = "---", hide = false},
	{label = "\tunfinished", hide = false},
	{label = "BAD_PROTO_VERSION unfinished", scriptrun	= "MpClientDisconnect(2)", hide = false}, --(unfinished)
	{label = "---", hide = false},
	{label = "\tdisband", hide = false},
	{label = "NOT_ENOUGH_PLAYERS disband", scriptrun	= "MpClientDisconnect(25)", hide = false}, -- (disband)
	{label = "GAME_DISBANDED disband", scriptrun	= "MpClientDisconnect(32)", hide = false}, -- (бой отменён, disband)
	{label = "---", hide = false},
	{label = "\tinstnaceTransfer", hide = false},
	{label = "INSTANCE_TRANSFER instnaceTransfer", scriptrun	= "MpClientDisconnect(30)", hide = false}, -- (сус, instnaceTransfer)
}