const { describe, it, expect } = require('vitest');
const Todos = require('./Todos');

describe('Todos Component', () => {
    it('renders correctly', () => {
        const todos = new Todos();
        expect(todos).toBeDefined();
    });

    it('adds a todo', () => {
        const todos = new Todos();
        todos.add('New Todo');
        expect(todos.list).toContain('New Todo');
    });

    it('removes a todo', () => {
        const todos = new Todos();
        todos.add('Todo to remove');
        todos.remove('Todo to remove');
        expect(todos.list).not.toContain('Todo to remove');
    });
});