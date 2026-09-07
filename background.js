const menuId = "open-in-outlook";

function registerMenu() {
  browser.menus.removeAll().then(() => {
    browser.menus.create({
      id: menuId,
      title: "Termin in Outlook oeffnen",
      contexts: ["selection"]
    });
  }).catch((error) => {
    console.error("Kontextmenue konnte nicht registriert werden:", error);
  });
}

registerMenu();
browser.runtime.onInstalled.addListener(registerMenu);
browser.runtime.onStartup.addListener(registerMenu);

browser.menus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== menuId || !tab?.id) {
    return;
  }

  try {
    const subject = (info.selectionText || "").trim();
    if (!subject) {
      throw new Error("Bitte zuerst den Termintext markieren.");
    }
    await browser.runtime.sendNativeMessage("confluence_outlook", { subject });
  } catch (error) {
    console.error("Outlook-Termin konnte nicht geoeffnet werden:", error);
    const message = `Outlook konnte nicht geoeffnet werden: ${error.message}`;
    await browser.tabs.sendMessage(tab.id, { type: "show-error", text: message }).catch(() => {});
  }
});
