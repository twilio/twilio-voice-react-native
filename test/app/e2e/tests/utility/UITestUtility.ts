import { by, element, waitFor } from 'detox';
import { expect } from 'detox';

export const DEFAULT_TIME_OUT = 10000;

export default class UITestUtility {
    private static alertButtonElement(label: string) {
        if (device.getPlatform() === 'ios') {
            return element(by.label(label).and(by.type('_UIAlertControllerActionView')));
        }
        return element(by.text(label.toUpperCase()));
    }

    /**
     * Use this method to check if element is visible by id
     */
    static async isVisibleById(selector: string, timeout: number = DEFAULT_TIME_OUT) {
        await waitFor(element(by.id(selector)))
            .toBeVisible()
            .withTimeout(timeout);
    }

    /**
     * Use this method to check if element is NOT visible by id
     */
    static async notVisibleById(selector: string, timeout: number = DEFAULT_TIME_OUT) {
        await waitFor(element(by.id(selector)))
            .toBeNotVisible()
            .withTimeout(timeout);
    }

    /**
     * Use this method to check if element is NOT visible by text
     */
    static async notVisibleByText(text: string, timeout: number = DEFAULT_TIME_OUT) {
        await waitFor(element(by.text(text)))
            .not.toBeVisible()
            .withTimeout(timeout);
    }

    /**
     * Use this method to check if element is visible by text
     */
    static async isVisibleByText(text: string, timeout: number = DEFAULT_TIME_OUT) {
        await waitFor(element(by.text(text)))
            .toBeVisible()
            .withTimeout(timeout);
    }
    /**
     * Use this method to check if element is visible by text at a specific index
     */
    static async isVisibleByTextAtIndex(
        text: string,
        index: number,
        timeout: number = DEFAULT_TIME_OUT,
    ) {
        await waitFor(element(by.text(text)).atIndex(index))
            .toBeVisible()
            .withTimeout(timeout);
    }
    /**
     * Check one by one if element is visible by multiple input text array
     */
    static async isVisibleByTexts(expectedTexts: string[], timeout: number = DEFAULT_TIME_OUT) {
        for (let text of expectedTexts) {
            await this.isVisibleByText(text);
        }
    }

    /**
     * Use this method to check if element with id has text
     */
    static async hasText(selector: string, text: string, timeout: number = DEFAULT_TIME_OUT) {
        await waitFor(element(by.id(selector)))
            .toHaveText(text)
            .withTimeout(timeout);
    }

    /**
     * Use this method to click on element by text
     */
    static async clickByText(text: string, timeout: number = DEFAULT_TIME_OUT) {
        await this.isVisibleByText(text, timeout);
        await element(by.text(text)).tap();
    }

    /**
     * Use this method to click on element by text at a specific index
     */
    static async clickByTextAtIndex(
        text: string,
        index: number,
        timeout: number = DEFAULT_TIME_OUT,
    ) {
        await this.isVisibleByTextAtIndex(text, 0, timeout);
        await element(by.text(text)).atIndex(index).tap();
    }

    /**
     * Use this method to click on element by label
     */
    static async clickByLabel(text: string) {
        await element(by.label(text)).tap();
    }

    /**
     * Use this method to click on element by id
     */
    static async clickById(selector: string) {
        await this.isVisibleById(selector);
        await element(by.id(selector)).tap();
    }

    static async clickByIdAndText(selector: string, text: string) {
        await element(by.id(selector).and(by.text(text))).tap();
    }

    /**
     * Use this method to replace text in element with id
     */
    static async replaceText(selector: string, textToReplace: string) {
        await this.isVisibleById(selector);
        await element(by.id(selector)).tap();
        await element(by.id(selector)).replaceText(textToReplace);
    }

    /**
     * Use this method to enter text in element with id
     */
    static async enterText(selector: string, textToType: string) {
        await this.isVisibleById(selector);
        await element(by.id(selector)).tap();
        await element(by.id(selector)).typeText(textToType);
    }

    /**
     * Clicks on native alert button
     * String to pass [text] has to be exactly like on ios
     * for android text will be optimized automatically
     * @param text
     */
    static async clickAlertButton(text: string, timeout: number = DEFAULT_TIME_OUT) {
        await this.alertButtonElement(text).tap();
    }

    /**
     * Check if alert button find by text is not visible.
     * @param text - Label text to search for alert button.
     */
    static async alertButtonIsNotVisible(text: string) {
        await expect(this.alertButtonElement(text)).not.toBeVisible();
    }

    /**
     * Use this method to assert that element
     * with specific ID and text is visible
     */
    static async isVisibleByIdAndText(
        selector: string,
        text: string,
        timeout: number = DEFAULT_TIME_OUT,
    ) {
        await waitFor(element(by.id(selector).and(by.text(text))))
            .toBeVisible()
            .withTimeout(timeout);
    }

    /**
     * Use this method to assert that element
     * with specific ID and text is NOT visible
     */
    static async notVisibleByIdAndText(
        selector: string,
        text: string,
        timeout: number = DEFAULT_TIME_OUT,
    ) {
        await waitFor(element(by.id(selector).and(by.text(text))))
            .toBeNotVisible()
            .withTimeout(timeout);
    }

    /**
     * Swipes on element by [text] in direction [direction]
     */
    static async swipeOnElementByText(text: string, direction: SwipeDirection) {
        await element(by.text(text)).swipe(direction);
    }
}
